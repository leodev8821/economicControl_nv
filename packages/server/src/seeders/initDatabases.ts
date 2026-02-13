// packages/server/src/seeders/initDatabases.ts
import { Transaction } from "sequelize";
import {
  Role,
  User,
  Application,
  UserPermission,
  CashDenomination,
  sequelizeInstance,
} from "../models/index.js";
import { ROLE_TYPES } from "@economic-control/shared";
import {
  APPLICATION_TYPES,
  APPLICATION_DESCRIPTIONS,
} from "@economic-control/shared";
import { env } from "../config/env.js";
import { fileURLToPath } from "url";
import { WeekActions } from "../models/finance-app/week.model.js";

// type RoleType = (typeof ROLE_TYPES)[keyof typeof ROLE_TYPES];
// type UserRole = typeof ROLE_TYPES.ADMINISTRADOR | typeof ROLE_TYPES.SUPER_USER;
// type ApplicationType =
//   (typeof APPLICATION_TYPES)[keyof typeof APPLICATION_TYPES];
// type ApplicationDescription =
//   (typeof APPLICATION_DESCRIPTIONS)[keyof typeof APPLICATION_DESCRIPTIONS];

interface DatabaseSeeder {
  run: () => Promise<void>;
  close: () => Promise<void>;
  connection: () => Promise<void>;
}

const databaseSeeder: DatabaseSeeder = {
  connection: async (): Promise<void> => {
    try {
      await sequelizeInstance.authenticate();
      console.log("✅ Conexión establecida");
    } catch (error) {
      console.error("❌ Error al conectar:", error);
      throw error;
    }
  },

  run: async (): Promise<void> => {
    try {
      /* ===========================
       * Connect
       * =========================== */
      await sequelizeInstance.authenticate(); //
      console.log("✅ Conexión establecida para seeding");

      await sequelizeInstance.sync();
      console.log("✅ Tablas sincronizadas/creadas");

      /* ===========================
       * Transaction
       * =========================== */
      await sequelizeInstance.transaction(async (transaction: Transaction) => {
        //
        /* ===========================
         * Seed roles
         * =========================== */
        const rolesToCreate = [
          { role_name: ROLE_TYPES.ADMINISTRADOR },
          { role_name: ROLE_TYPES.SUPER_USER },
          { role_name: ROLE_TYPES.LEADER },
          { role_name: ROLE_TYPES.USUARIO },
        ]; //

        for (const roleData of rolesToCreate) {
          await Role.findOrCreate({
            where: { role_name: roleData.role_name },
            defaults: { role_name: roleData.role_name },
            transaction,
          });
        } //
        console.log("✅ Roles verificados/creados");

        /* ===========================
         * 2. Seed Applications (Nuevo)
         * Basado en application.schema.ts
         * =========================== */
        const appsToSeed = [
          {
            app_name: APPLICATION_TYPES.ALL,
            description: APPLICATION_DESCRIPTIONS.ALL,
          },
          {
            app_name: APPLICATION_TYPES.FINANCE,
            description: APPLICATION_DESCRIPTIONS.FINANCE,
          },
          {
            app_name: APPLICATION_TYPES.CONSOLIDATION,
            description: APPLICATION_DESCRIPTIONS.CONSOLIDATION,
          },
        ];

        for (const app of appsToSeed) {
          await Application.findOrCreate({
            where: { app_name: app.app_name },
            defaults: app,
            transaction,
          });
        }
        console.log("✅ Aplicaciones verificadas/creadas");

        /* ===========================
         * Seed cash denominations
         * =========================== */
        const denominationsToCreate = [
          "500",
          "200",
          "100",
          "50",
          "20",
          "10",
          "5",
          "2",
          "1",
          "0.5",
          "0.2",
          "0.1",
          "0.05",
          "0.02",
          "0.01",
        ].map((val) => ({ denomination_value: val, quantity: 0 })); //

        for (const denom of denominationsToCreate) {
          await CashDenomination.findOrCreate({
            where: { denomination_value: denom.denomination_value },
            defaults: denom,
            transaction,
          });
        } //
        console.log("✅ Denominaciones verificadas/creadas");

        /* ===========================
         * Seed super user
         * =========================== */
        let sudoUser = await User.findOne({
          where: { username: env.SUDO_USERNAME },
          transaction,
        });

        if (!sudoUser) {
          sudoUser = await User.create(
            {
              role_name: env.SUDO_ROLE as any,
              username: env.SUDO_USERNAME,
              password: env.SUDO_PASSWORD,
              first_name: env.SUDO_FIRSTNAME,
              last_name: env.SUDO_LASTNAME,
              email: env.SUDO_EMAIL,
              phone: env.SUDO_PHONE,
              is_visible: env.SUDO_IS_VISIBLE,
            },
            { transaction },
          );
          console.log("✅ SuperUsuario creado");
        }

        // Asignar permisos automáticos al SuperUser para todas las apps
        if (sudoUser) {
          await UserPermission.findOrCreate({
            where: {
              user_id: sudoUser.id,
              application_id: 1,
            },
            defaults: {
              user_id: sudoUser.id,
              application_id: 1,
              role_id: 2, //2 es SUPER_USER
            },
            transaction,
          });
          console.log(
            `✅ Permiso '${APPLICATION_TYPES.ALL}' asignado al SuperUser`,
          );
        }

        /* ===========================
         * Seed super weeks
         * =========================== */
        const actualYear = new Date().getFullYear();
        await WeekActions.generateWeeksForYear(actualYear);
        console.log(`✅ Semanas del año '${actualYear}' creadas`);
      });

      console.log("🎉 Seeding completado correctamente");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      console.error("❌ Error durante el seeding:", message);
      process.exit(1);
    }
  },

  close: async (): Promise<void> => {
    await sequelizeInstance.close(); //
    console.log("🧹 Conexiones de seeding cerradas");
  },
};

// ==========================================
// 🚀 LÓGICA DE EJECUCIÓN PARA ESM
// ==========================================
const isMainModule = () => {
  if (typeof process === "undefined" || !process.argv[1]) return false;
  const scriptPath = fileURLToPath(import.meta.url);
  return process.argv[1] === scriptPath;
};

if (isMainModule()) {
  (async () => {
    await databaseSeeder.run();
    await databaseSeeder.close();
  })();
}

export default databaseSeeder;
