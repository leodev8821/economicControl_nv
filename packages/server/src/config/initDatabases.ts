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

      /* ===========================
       * Sync models
       * =========================== */
      await sequelizeInstance.sync();
      console.log("✅ Modelos sincronizados");

      /* ===========================
       * Transaction
       * =========================== */
      await sequelizeInstance.transaction(async (transaction: Transaction) => {
        /* ===========================
         * Seed roles
         * =========================== */
        const existsRole = await Role.findOne({ transaction });
        if (!existsRole) {
          await Role.bulkCreate(
            [
              { role: ROLE_TYPES.ADMINISTRADOR },
              { role: ROLE_TYPES.SUPER_USER },
            ],
            { transaction }
          );
          console.log("✅ Roles creados");
        }

        /* ===========================
         * Seed cash denominations
         * =========================== */
        const existsCash = await CashDenomination.findOne({ transaction });
        if (!existsCash) {
          await CashDenomination.bulkCreate(
            [
              { value: "500", quantity: 0 },
              { value: "200", quantity: 0 },
              { value: "100", quantity: 0 },
              { value: "50", quantity: 0 },
              { value: "20", quantity: 0 },
              { value: "10", quantity: 0 },
              { value: "5", quantity: 0 },
              { value: "2", quantity: 0 },
              { value: "1", quantity: 0 },
              { value: "0.5", quantity: 0 },
              { value: "0.2", quantity: 0 },
              { value: "0.1", quantity: 0 },
              { value: "0.05", quantity: 0 },
              { value: "0.02", quantity: 0 },
              { value: "0.01", quantity: 0 },
            ],
            { transaction }
          );
          console.log("✅ Denominaciones creadas");
        }

        /* ===========================
         * Seed super user
         * =========================== */
        const existsSuperUser = await User.findOne({ transaction });
        if (!existsSuperUser) {
          if (!Object.values(ROLE_TYPES).includes(env.SUDO_ROLE as RoleType)) {
            throw new Error("Rol del superusuario inválido");
          }

          await User.create(
            {
              role: env.SUDO_ROLE as UserRole,
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
