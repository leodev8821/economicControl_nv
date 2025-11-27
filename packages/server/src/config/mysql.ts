import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  Cash,
  Income,
  Outcome,
  Person,
  Report,
  Role,
  User,
  Week,
} from "../models/index.ts";

import { ROLE_TYPES } from "@economic-control/shared";

type RoleType = (typeof ROLE_TYPES)[keyof typeof ROLE_TYPES];
type UserRole = typeof ROLE_TYPES.ADMINISTRADOR | typeof ROLE_TYPES.SUPER_USER;

import { getSequelizeConfig } from "./sequelize.config.ts";

interface RoleData {
  role: RoleType;
}

interface SudoUserData {
  role: UserRole;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  isVisible: boolean;
}

interface DatabaseConnection {
  connection: () => Promise<void>;
}

const database: DatabaseConnection = {
  connection: async (): Promise<void> => {
    const __dirname: string = dirname(fileURLToPath(import.meta.url));
    const envPath: string = join(__dirname, "../../.env");
    dotenv.config({ path: envPath });

    const MY_SUDO_ROLE: string | undefined = process.env.SUDO_ROLE;
    const MY_SUDO_USER: string | undefined = process.env.SUDO_USERNAME;
    const MY_SUDO_PASSWORD: string | undefined = process.env.SUDO_PASSWORD;
    const MY_SUDO_FIRSTNAME: string | undefined = process.env.SUDO_FIRSTNAME;
    const MY_SUDO_LASTNAME: string | undefined = process.env.SUDO_LASTNAME;
    const MY_SUDO_IS_VISIBLE: string | undefined = process.env.SUDO_IS_VISIBLE;

    const sequelize: Sequelize = getSequelizeConfig();

    try {
      await sequelize.authenticate();
      console.log("✅ MySQL conectado");

      await Role.sync();
      await Cash.sync();
      await Week.sync();
      await Person.sync();
      await User.sync();
      await Income.sync();
      await Outcome.sync();
      await Report.sync();
      console.log("✅ Modelos sincronizados con la base de datos.");

      // Insertar roles si la tabla está vacía
      const roleCount: number = await Role.count();
      if (roleCount === 0) {
        const rolesToInsert: RoleData[] = [
          { role: ROLE_TYPES.ADMINISTRADOR },
          { role: ROLE_TYPES.SUPER_USER },
        ];
        await Role.bulkCreate(rolesToInsert);
        console.log("✅ Roles iniciales insertados.");
      } else {
        console.log(
          "⚠️ Los roles ya existen, no se insertaron nuevos registros."
        );
      }

      // Insertar usuario superUser si la tabla está vacía
      const userCount: number = await User.count();
      if (userCount === 0) {
        // Validación de variables de entorno para el superusuario
        if (
          !MY_SUDO_ROLE ||
          !MY_SUDO_USER ||
          !MY_SUDO_PASSWORD ||
          !MY_SUDO_FIRSTNAME ||
          !MY_SUDO_LASTNAME ||
          !MY_SUDO_IS_VISIBLE
        ) {
          throw new Error(
            "Faltan variables de entorno requeridas para el superusuario"
          );
        }

        // Validar que el rol del superusuario sea válido
        if (!Object.values(ROLE_TYPES).includes(MY_SUDO_ROLE as RoleType)) {
          throw new Error("El rol del superusuario no es válido");
        }

        const sudoUser: SudoUserData = {
          role: MY_SUDO_ROLE as UserRole,
          username: MY_SUDO_USER,
          password: MY_SUDO_PASSWORD,
          first_name: MY_SUDO_FIRSTNAME,
          last_name: MY_SUDO_LASTNAME,
          isVisible: MY_SUDO_IS_VISIBLE === "true", // Convierte a booleano si viene como string
        };
        await User.create(sudoUser);
        console.log("✅ Superusuario creado");
      } else {
        console.log("⚠️ Superusuario ya existe");
      }
    } catch (error: unknown) {
      const errorMessage: string =
        error instanceof Error ? error.message : "Error desconocido";
      console.error("❌ Error de conexión a MySQL:", errorMessage);
    }
  },
};

export default database;
