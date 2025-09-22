import { DataTypes, Op, Model as SequelizeModel, Optional } from "sequelize";
import { getSequelizeConfig } from "../config/mysql";

const connection = getSequelizeConfig();

/** Tipos para el modelo */
export interface ReportAttributes {
  id: number;
  week_id: number;
  total_income: string; // DECIMAL -> string para evitar pérdida de precisión
  total_outcome: string; // DECIMAL -> string
  net_balance: string; // DECIMAL -> string
}

/** Campos opcionales al crear (id autoincremental) */
export interface ReportCreationAttributes
  extends Optional<ReportAttributes, "id"> {}

/** Clase tipada de Sequelize */
class ReportModel
  extends SequelizeModel<ReportAttributes, ReportCreationAttributes>
  implements ReportAttributes
{
  public id!: number;
  public week_id!: number;
  public total_income!: string;
  public total_outcome!: string;
  public net_balance!: string;
}

// Extender el tipo de instancia del modelo
interface IReportModel extends ReportModel {
    get: (options: { plain: true }) => ReportAttributes;
}

// Exportar el modelo con los tipos correctos
export const Report = ReportModel as unknown as typeof ReportModel & {
    new (): IReportModel;
    findOne: (options: any) => Promise<IReportModel | null>;
    findAll: (options: any) => Promise<IReportModel[]>;
    create: (data: ReportCreationAttributes) => Promise<IReportModel>;
    update: (data: Partial<ReportAttributes>, options: any) => Promise<[number]>;
    destroy: (options: any) => Promise<number>;
};

/** Inicialización del modelo */
(ReportModel as unknown as typeof SequelizeModel).init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    week_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "weeks",
        key: "id",
      },
    },
    total_income: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: "0.00",
    },
    total_outcome: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: "0.00",
    },
    net_balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: "0.00",
    },
  },
  {
    sequelize: connection,
    tableName: "reports",
    timestamps: false,
  }
);

/**
 * Obtiene el informe único de una semana.
 * @param weekId number
 * @returns Promise<ReportAttributes | null>
 */
export async function getReportByWeek(
  weekId: number
): Promise<ReportAttributes | null> {
  try {
    const report = await Report.findOne({
      where: { week_id: weekId },
      raw: true,
    });
    return (report as ReportAttributes) ?? null;
  } catch (error: any) {
    console.error("Error al obtener informe por semana:", error.message);
    throw new Error(`Error al obtener informe por semana: ${error.message}`);
  }
}

/**
 * Crea un nuevo informe (solo uno por semana).
 * @param data ReportCreationAttributes
 * @returns Promise<ReportAttributes | null>
 */
export async function createNewReport(
  data: ReportCreationAttributes
): Promise<ReportAttributes | null> {
  try {
    const existing = await Report.findOne({
      where: { week_id: (data as any).week_id },
    });
    if (existing) return null;

    const newReport = await Report.create(data);
    return newReport.get({ plain: true }) as ReportAttributes;
  } catch (error: any) {
    console.error("Error al crear Informe:", error.message);
    throw new Error(`Error al crear Informe: ${error.message}`);
  }
}

/**
 * Obtiene todos los informes.
 * @returns Promise<ReportAttributes[]>
 */
export async function getAllReports(): Promise<ReportAttributes[]> {
  try {
    return await Report.findAll({ raw: true }) as ReportAttributes[];
  } catch (error: any) {
    console.error("Error al consultar la base de datos: ", error.message);
    throw new Error(`Error al consultar la base de datos: ${error.message}`);
  }
}

/**
 * Obtiene un informe por id.
 * @param id number
 * @returns Promise<ReportAttributes | null>
 */
export async function getOneReport(id: number): Promise<ReportAttributes | null> {
  try {
    const report = await Report.findOne({ where: { id }, raw: true });
    if (!report) return null;
    return report as ReportAttributes;
  } catch (error: any) {
    console.error(`Error al buscar informe con Id "${id}":`, error.message);
    throw new Error(`Error al buscar informe con Id "${id}": ${error.message}`);
  }
}

/**
 * Actualiza un informe por id.
 * @param id number
 * @param newData Partial<ReportAttributes>
 * @returns Promise<ReportAttributes | null>
 */
export async function updateOneReport(
  id: number,
  newData: Partial<ReportAttributes>
): Promise<ReportAttributes | null> {
  try {
    const report = await Report.findOne({ where: { id }, raw: true });
    if (!report) return null;

    await Report.update(newData, { where: { id } });

    return { ...(report as ReportAttributes), ...(newData as object) } as ReportAttributes;
  } catch (error: any) {
    console.error("Error al actualizar informe:", error.message);
    throw new Error(`Error al actualizar informe: ${error.message}`);
  }
}

/**
 * Elimina un informe por id (hard delete).
 * @param id number
 * @returns Promise<ReportAttributes | null> - datos del informe eliminado o null si no existe
 */
export async function deleteReport(id: number): Promise<ReportAttributes | null> {
  try {
    const report = await Report.findOne({ where: { id }, raw: true });
    if (!report) return null;

    await Report.destroy({ where: { id } });
    return report as ReportAttributes;
  } catch (error: any) {
    console.error(`Error al eliminar el informe ${id}`, error.message);
    throw new Error(`Error al eliminar el Informe: ${error.message}`);
  }
}
