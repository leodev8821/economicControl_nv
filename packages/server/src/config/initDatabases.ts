import { Transaction } from "sequelize";
import { Role, User, CashDenomination } from "../models/index.ts";
import { ROLE_TYPES } from "@economic-control/shared";
import { env } from "./env.ts";
import { getSequelizeConfig } from "./sequelize.config.ts";

let sequelizeInstance = getSequelizeConfig();

type RoleType = (typeof ROLE_TYPES)[keyof typeof ROLE_TYPES];
type UserRole = typeof ROLE_TYPES.ADMINISTRADOR | typeof ROLE_TYPES.SUPER_USER;

interface DatabaseConnection {
  connection: () => Promise<void>;
  close: () => Promise<void>;
}

const database: DatabaseConnection = {
  connection: async (): Promise<void> => {
    try {
      /* ===========================
       * Connect
       * =========================== */
      await sequelizeInstance.authenticate();
      console.log("✅ Base de datos conectada");
      console.log("ℹ️ Dialecto detectado:", sequelizeInstance.getDialect());

      /* ===========================
       * Sync models
       * =========================== */
      await sequelizeInstance.sync({ force: true });
      console.log("✅ Modelos sincronizados");

      /* ===========================
       * Transaction
       * =========================== */
      await sequelizeInstance.transaction(async (transaction: Transaction) => {
        /* ===========================
         * Seed roles
         * =========================== */
        const rolesToCreate = [
          { role_name: ROLE_TYPES.ADMINISTRADOR },
          { role_name: ROLE_TYPES.SUPER_USER },
        ];

        for (const roleData of rolesToCreate) {
          await Role.findOrCreate({
            where: { role_name: roleData.role_name.trim() },
            defaults: { role_name: roleData.role_name },
            transaction,
          });
        }
        console.log("✅ Roles verificados/creados");

        /* ===========================
         * Seed cash denominations
         * =========================== */
        const denominationsToCreate = [
          { denomination_value: "500", quantity: 0 },
          { denomination_value: "200", quantity: 0 },
          { denomination_value: "100", quantity: 0 },
          { denomination_value: "50", quantity: 0 },
          { denomination_value: "20", quantity: 0 },
          { denomination_value: "10", quantity: 0 },
          { denomination_value: "5", quantity: 0 },
          { denomination_value: "2", quantity: 0 },
          { denomination_value: "1", quantity: 0 },
          { denomination_value: "0.5", quantity: 0 },
          { denomination_value: "0.2", quantity: 0 },
          { denomination_value: "0.1", quantity: 0 },
          { denomination_value: "0.05", quantity: 0 },
          { denomination_value: "0.02", quantity: 0 },
          { denomination_value: "0.01", quantity: 0 },
        ];

        for (const denom of denominationsToCreate) {
          await CashDenomination.findOrCreate({
            where: { denomination_value: denom.denomination_value },
            defaults: denom,
            transaction,
          });
        }
        console.log("✅ Denominaciones verificadas/creadas");

        /* ===========================
         * Seed super user
         * =========================== */
        const existsSuperUser = await User.findOne({ transaction });
        if (!existsSuperUser) {
          if (!Object.values(ROLE_TYPES).includes(env.SUDO_ROLE as RoleType)) {
            throw new Error("Rol del superusuario inválido");
          }

          console.warn("role_name", env.SUDO_ROLE);

          await User.create(
            {
              role_name: env.SUDO_ROLE as UserRole,
              username: env.SUDO_USERNAME,
              password: env.SUDO_PASSWORD,
              first_name: env.SUDO_FIRSTNAME,
              last_name: env.SUDO_LASTNAME,
              isVisible: env.SUDO_IS_VISIBLE,
            },
            { transaction }
          );

          console.log("✅ Superusuario creado");
        }
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
    if (sequelizeInstance) {
      await sequelizeInstance.close();
      console.log("🧹 Conexiones cerradas");
    }
  },
};

export default database;
