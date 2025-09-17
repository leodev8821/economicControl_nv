import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Cash, Income, Outcome, Person, Report, Role, User, Week } from "../models/index.js";

export function getSequelizeConfig() {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const envPath = join(__dirname, '../../.env');
    dotenv.config({ path: envPath });

    const MY_DB = process.env.DB_DB;
    const MY_USER = process.env.DB_USER;
    const MY_PASSWORD = process.env.DB_PASSWORD;
    const MY_HOST = process.env.DB_HOST;
    const MY_PORT = parseInt(process.env.DB_PORT, 10) || '3306';

    return new Sequelize(MY_DB, MY_USER, MY_PASSWORD, {
        host: MY_HOST,
        port: MY_PORT,
        dialect: 'mysql',
        logging: false,
    });
}

export default {
    connection: async () => {
        const __dirname = dirname(fileURLToPath(import.meta.url));
        const envPath = join(__dirname, '../../.env');
        dotenv.config({ path: envPath });

        const MY_SUDO_ROLE = process.env.SUDO_ROLE;
        const MY_SUDO_USER = process.env.SUDO_USERNAME;
        const MY_SUDO_PASSWORD = process.env.SUDO_PASSWORD;
        const MY_SUDO_FIRSTNAME = process.env.SUDO_FIRSTNAME;
        const MY_SUDO_LASTNAME = process.env.SUDO_LASTNAME;
        const MY_SUDO_IS_ViSIBLE = process.env.SUDO_IS_VISIBLE;

        const sequelize = getSequelizeConfig();
        try {
            await sequelize.authenticate();
            console.log('✅ MySQL conectado');
            await Role.sync();
            await Cash.sync();
            await Week.sync();
            await Person.sync();
            await User.sync();
            await Income.sync();
            await Outcome.sync();
            await Report.sync();
            console.log('✅ Modelos sincronizados con la base de datos.');

            // Insertar roles si la tabla está vacía
            const roleCount = await Role.count();
            if (roleCount === 0) {
                const rolesToInsert = [
                    { role: 'Administrador' },
                    { role: 'SuperUser' }
                ];
                await Role.bulkCreate(rolesToInsert);
                console.log('✅ Roles iniciales insertados.');
            } else {
                console.log('⚠️ Los roles ya existen, no se insertaron nuevos registros.');
            }

            //Insertar usuario superUser si la tabla está vacía
            const userCount = await User.count();
            if (userCount === 0) {
                const sudoUser = {
                    role: MY_SUDO_ROLE,
                    username: MY_SUDO_USER,
                    password: MY_SUDO_PASSWORD,
                    first_name: MY_SUDO_FIRSTNAME,
                    last_name: MY_SUDO_LASTNAME,
                    isVisible: MY_SUDO_IS_ViSIBLE === 'true' // Convierte a booleano si viene como string
                };
                await User.create(sudoUser);
                console.log('✅ Superusuario creado');
            } else {
                console.log('⚠️ Superusuario ya existe');
            }
    } catch (error) {
			console.error('❌ Error de conexión a MySQL:', error.message);
		}
	}
}