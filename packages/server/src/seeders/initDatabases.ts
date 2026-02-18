// packages/server/src/seeders/initDatabases.ts
import { Transaction } from "sequelize";
import {
  Role,
  User,
  Application,
  UserPermission,
  CashDenomination,
  sequelizeInstance,
  Cash,
} from "../models/index.js";
import { ROLE_TYPES } from "@economic-control/shared";
import {
  APPLICATION_TYPES,
  APPLICATION_DESCRIPTIONS,
} from "@economic-control/shared";
import { env } from "../config/env.js";
import { fileURLToPath } from "url";
import { WeekActions } from "../models/finance-app/week.model.js";

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
          { role_name: ROLE_TYPES.LIDER },
          { role_name: ROLE_TYPES.MIEMBRO },
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
         * Seed cash
         * =========================== */
        const cashToSeed = [
          { cash_name: "GENERAL" },
          { cash_name: "CAFETERIA" },
        ];

        for (const cash of cashToSeed) {
          await Cash.findOrCreate({
            where: { name: cash.cash_name },
            transaction,
          });
        }
        console.log("✅ Cajas verificadas/creadas");

        /* ===========================
         * Seed cash denominations
         * =========================== */
        const cashIds = [1, 2]; // IDs de 'General' y 'CAFETERIA'
        const values = [
          500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01,
        ];

        for (const cash_id of cashIds) {
          for (const val of values) {
            await CashDenomination.findOrCreate({
              // Ahora buscamos por la combinación de caja y valor
              where: {
                cash_id: cash_id,
                denomination_value: val,
              },
              defaults: {
                cash_id: cash_id,
                denomination_value: val,
                quantity: 0,
              },
              transaction,
            });
          }
        }
        console.log(
          `✅ Denominaciones verificadas/creadas para ${cashIds.length} cajas`,
        );

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
