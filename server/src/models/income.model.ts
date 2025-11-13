import { DataTypes, Model, Optional } from "sequelize";
import { getSequelizeConfig } from "../config/mysql";
import { PersonModel } from "./person.model";
import { WeekModel } from "./week.model";

const connection = getSequelizeConfig();

export enum IncomeSource {
    DIEZMO = 'Diezmo',
    OFRENDA = 'Ofrenda',
    CAFETERIA = 'Cafetería',
    OTRO = 'Otro'
}

// Interfaces para el modelo Income
export interface IncomeAttributes {
    id: number;
    person_id: number | null; // Usar 'null' para manejar la opcionalidad explícitamente en la base de datos
    week_id: number;
    date: string;
    amount: number;
    source: IncomeSource;
}

export type IncomeSearchData = {
    id?: number;
    person_id?: number;
    week_id?: number;
    date?: string;
    source?: string | IncomeSource;
};

// Opcionalidad para la creación (id es auto-generado)
export interface IncomeCreationAttributes extends Optional<IncomeAttributes, 'id' | 'person_id'> {}

// Definición del modelo
export class IncomeModel extends Model<IncomeAttributes, IncomeCreationAttributes> implements IncomeAttributes {
    declare id: number;
    declare person_id: number | null;
    declare week_id: number;
    declare date: string;
    declare amount: number;
    declare source: IncomeSource;
}

// 💡 Constante para la configuración de inclusión (JOINs)
const INCOME_INCLUDE_CONFIG = [
    {
        model: PersonModel, 
        as: 'Person',
        attributes: ['id', 'dni', 'first_name', 'last_name'],
        required: false,
    },
    {
        model: WeekModel, 
        as: 'Week',
        attributes: ['id', 'week_start', 'week_end'],
        required: true,
    }
];

// Inicialización del modelo
IncomeModel.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    person_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'persons',
            key: 'id',
        },
    },
    week_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'weeks',
            key: 'id',
        },
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      get() {
        const val = this.getDataValue('amount');
        return val ? parseFloat(String(val)) : 0;
      },
    },
    source: {
        type: DataTypes.ENUM(...Object.values(IncomeSource)),
        allowNull: false,
    }
}, {
    sequelize: connection,
    tableName: 'incomes',
    timestamps: false,
    modelName: 'Income'
});

export class IncomeActions {

    /**
     * Obtiene todas las ingresos de la base de datos.
     * @returns promise con un array de objetos IncomeAttributes.
     */
    public static async getAll(): Promise<IncomeAttributes[]> {
        const incomes = await IncomeModel.findAll({ include: INCOME_INCLUDE_CONFIG });
        return incomes.map(income => income.get({ plain: true }));
    }

    /**
     * obtiene un ingreso que cumpla con los criterios de búsqueda proporcionados.
     * @param data criterios de búsqueda.
     * @returns promise con un objeto IncomeAttributes o null si no se encuentra ningun ingreso.
     */
    public static async getOne(data: IncomeSearchData): Promise<IncomeAttributes | null> {
        const income = await IncomeModel.findOne({ where: data, include: INCOME_INCLUDE_CONFIG });
        return income ? income.get({ plain: true }) : null;
    }

    /**
     * Crea un nuevo ingreso en la base de datos.
     * @param data datos de la ingreso a crear.
     * @returns promise con el objeto IncomeAttributes creado.
     */
    public static async create(data: IncomeCreationAttributes): Promise<IncomeAttributes> {
        const newIncome = await IncomeModel.create(data);
        return newIncome.get({ plain: true });
    }

    /**
     * Elimina un ingreso de la base de datos por su ID.
     * @param data criterios de búsqueda para la ingreso a eliminar.
     * @returns promise con un booleano que indica si la eliminación fue exitosa.
     */
    public static async delete(data: IncomeSearchData): Promise<boolean> {
        const deletedCount = await IncomeModel.destroy({ where: data });
        return deletedCount > 0;
    }

    /**
     * Actualiza un ingreso existente en la base de datos.
     * @param id ID de la ingreso a actualizar.
     * @param data datos a actualizar.
     * @returns promise con un booleano que indica si la actualización fue exitosa.
     */
    public static async update(id: number, data: Partial<IncomeCreationAttributes>): Promise<IncomeAttributes | null> {
        const [updatedCount] = await IncomeModel.update(data, { where: { id } });
        if(updatedCount === 0) {
            return null;
        }
        const updatedIncome = await IncomeModel.findByPk(id);
        return updatedIncome ? updatedIncome.get({ plain: true }) : null;
    }

    /**
     * Obtiene ingresos de tipo 'Diezmo' para una persona por su DNI.
     */
    public static async getTitheIncomesByDni(dni: string): Promise<IncomeAttributes[]> {
        const person = await PersonModel.findOne({ where: { dni }, include: INCOME_INCLUDE_CONFIG});
        if (!person) {
            return [];
        }
        const incomes = await IncomeModel.findAll({ where: {person_id: person.id, source: IncomeSource.DIEZMO },include: INCOME_INCLUDE_CONFIG});
        return incomes.map(income => income.get({ plain: true }));
    }

    /**
     * Obtiene todos los ingresos para una fecha específica.
     */
    public static async getIncomesByDate(date: string): Promise<IncomeAttributes[]> {
        const incomes = await IncomeModel.findAll(
            { 
                where: { date },
                include: INCOME_INCLUDE_CONFIG,
            }
        );
        return incomes.map(income => income.get({ plain: true }));
    }

    /**
     * Obtiene todos los ingresos para un ID de semana específico. ⬅️ NUEVA FUNCIÓN
     */
    public static async getIncomesByWeekId(weekId: number): Promise<IncomeAttributes[]> {
        const incomes = await IncomeModel.findAll(
            { 
                where: { week_id: weekId },
                include: INCOME_INCLUDE_CONFIG,
            }
    );
        return incomes.map(income => income.get({ plain: true }));
    }
}