import { DataTypes, Op, Model as SequelizeModel, Optional } from "sequelize";
import { getSequelizeConfig } from "../config/mysql";
import { Income, IncomeAttributes } from './income.model';
import { Outcome, OutcomeAttributes } from './outcome.model';

const connection = getSequelizeConfig();

/** Tipos del modelo */
export interface WeekAttributes {
  id: number;
  week_start: Date;
  week_end: Date;
}

/** Campos opcionales al crear (id autoincremental) */
export interface WeekCreationAttributes extends Optional<WeekAttributes, 'id'> {}

/** Clase tipada Sequelize */
class WeekModel extends SequelizeModel<WeekAttributes, WeekCreationAttributes> implements WeekAttributes {
  public id!: number;
  public week_start!: Date;
  public week_end!: Date;
}

// Extender el tipo de instancia del modelo
interface IWeekModel extends WeekModel {
    get: (options: { plain: true }) => WeekAttributes;
}

// Exportar el modelo con los tipos correctos
export const Week = WeekModel as unknown as typeof WeekModel & {
    new (): IWeekModel;
    findOne: (options: any) => Promise<IWeekModel | null>;
    findAll: (options: any) => Promise<IWeekModel[]>;
    create: (data: WeekCreationAttributes) => Promise<IWeekModel>;
    update: (data: Partial<WeekAttributes>, options: any) => Promise<[number]>;
    destroy: (options: any) => Promise<number>;
};

/** Inicialización del modelo */
(WeekModel as unknown as typeof SequelizeModel).init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  week_start: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true,
  },
  week_end: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true,
  }
}, {
  sequelize: connection,
  tableName: 'weeks',
  timestamps: false,
});

/**
 * Obtiene todos los ingresos agrupados por semana.
 * @async
 * @function getIncomesByWeek
 * @param {number} weekId - ID de la semana.
 * @returns {Promise<IncomeAttributes[]>} - Lista de ingresos de la semana.
 * @throws {Error} - Lanza un error si hay un problema al consultar la base de datos.
 */
export async function getIncomesByWeek(weekId: number): Promise<IncomeAttributes[]> {
    try {
        return await Income.findAll({
            where: { week_id: weekId },
            raw: true
        });
    } catch (error: any) {
        console.error('Error al obtener ingresos por semana:', error.message);
        throw new Error(`Error al obtener ingresos por semana: ${error.message}`);
    }
}

/**
 * Obtiene todos los gastos agrupados por semana.
 * @param weekId - ID de la semana.
 * @returns Lista de gastos de la semana.
 */
export async function getOutcomesByWeek(weekId: number): Promise<OutcomeAttributes[]> {
    try {
        return await Outcome.findAll({
            where: { week_id: weekId },
            raw: true
        });
    } catch (error: any) {
        console.error('Error al obtener gastos por semana:', error.message);
        throw new Error(`Error al obtener gastos por semana: ${error.message}`);
    }
}

/**
 * Crea una nueva semana.
 * @param data - Datos de la nueva semana.
 * @returns La nueva semana creada o null si ya existe.
 */
export async function createNewWeek(data: WeekCreationAttributes): Promise<WeekAttributes | null> {
    try {
        const uniqueFields = ["week_start", "week_end"] as const;
        const week = await Week.findOne({
            where: {
                [Op.or]: uniqueFields.map((field) => ({ [field]: data[field] }))
            },
            raw: true
        });
        
        if (week) return null;
        
        const newWeek = await Week.create(data);
        return newWeek.get({ plain: true }) as WeekAttributes;
    } catch (error: any) {
        console.error('Error al crear Semana:', error.message);
        throw new Error(`Error al crear Semana: ${error.message}`);
    }
}

/**
 * Obtiene todas las semanas.
 * @returns Lista de todas las semanas.
 */
export async function getAllWeeks(): Promise<WeekAttributes[]> {
    try {
        return await Week.findAll({ raw: true }) as WeekAttributes[];
    } catch (error: any) {
        console.error('Error al consultar la base de datos: ', error.message);
        throw new Error(`Error al consultar la base de datos: ${error.message}`);
    }
}

/**
 * Obtiene una semana por ID, fecha de inicio o fin
 * @param data - ID, week_start o week_end.
 * @returns La semana encontrada o null si no existe.
 */
export async function getOneWeek(data: string | number | Date): Promise<WeekAttributes | null> {
    try {
        const fields = ["id", "week_start", "week_end"] as const;
        const searchValue = typeof data === 'string' ? data.trim() : data;
        const week = await Week.findOne({
            where: {
                [Op.or]: fields.map((field) => ({ [field]: searchValue }))
            },
            raw: true
        });
        
        return week as WeekAttributes | null;
    } catch (error: any) {
        console.error(`Error al buscar semana con Id, inicio o fin "${data}":`, error.message);
        throw new Error(`Error al buscar semana con Id, inicio o fin "${data}": ${error.message}`);
    }
}

/**
 * Actualiza una semana por ID, fecha de inicio o fin
 * @param weekInfo - Array de campos para buscar la semana.
 * @param newData - Datos para actualizar la semana.
 * @returns La semana actualizada o null si no existe.
 */
export async function updateOneWeek(
    weekInfo: (keyof WeekAttributes)[],
    newData: Partial<WeekAttributes>
): Promise<WeekAttributes | null> {
    try {
        const whereClause: Record<string, any> = {};
        weekInfo.forEach(field => {
            if (newData[field] !== undefined) {
                whereClause[field] = newData[field];
            }
        });

        const week = await Week.findOne({
            where: whereClause,
            raw: true
        });
        
        if (!week) return null;

        await Week.update(newData, { where: whereClause });
        const updatedWeek = await Week.findOne({
            where: whereClause,
            raw: true
        });
        
        return updatedWeek as WeekAttributes;
    } catch (error: any) {
        console.error('Error al actualizar semana:', error.message);
        throw new Error(`Error al actualizar semana: ${error.message}`);
    }
}

/**
 * Elimina una semana por ID, fecha de inicio o fin
 * @param weekInfo - Objeto con los campos para buscar la semana.
 * @returns La semana eliminada o null si no existe.
 */
export async function deleteWeek(weekInfo: Partial<WeekAttributes>): Promise<WeekAttributes | null> {
    try {
        const week = await Week.findOne({
            where: weekInfo,
            raw: true
        });
        
        if (!week) return null;

        await Week.destroy({ where: weekInfo });
        return week as WeekAttributes;
    } catch (error: any) {
        console.error(`Error al eliminar la semana ${JSON.stringify(weekInfo)}:`, error.message);
        throw new Error(`Error al eliminar la Semana: ${error.message}`);
    }
}

