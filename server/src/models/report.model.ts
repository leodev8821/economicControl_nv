import { DataTypes, Model as SequelizeModel, Optional } from "sequelize";
import { getSequelizeConfig } from "../config/mysql";
import { WeekModel } from "./week.model";

const connection = getSequelizeConfig();

/** Tipos para el modelo */
export interface ReportAttributes {
  id: number;
  week_id: number;
  total_income: number;
  total_outcome: number;
  net_balance: number;
}

export type ReportSearchData = {
  id?: number;
  week_id?: number;
};

/** Campos opcionales al crear (id autoincremental) */
export interface ReportCreationAttributes
  extends Optional<ReportAttributes, "id"> {}

/** Clase tipada de Sequelize */
export class ReportModel
  extends SequelizeModel<ReportAttributes, ReportCreationAttributes>
  implements ReportAttributes
{
  declare id: number;
  declare week_id: number;
  declare total_income: number;
  declare total_outcome: number;
  declare net_balance: number;
}

// 💡 Constante para la configuración de inclusión (JOINs)
const REPORT_INCLUDE_CONFIG = [
    {
        model: WeekModel, 
        as: 'Week',
        attributes: ['id', 'week_start', 'week_end'],
        required: true,
    }
];

/** Inicialización del modelo */
ReportModel.init(
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
      unique: true, // Aseguramos que solo haya un informe por semana
    },
    total_income: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    total_outcome: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    net_balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
  },
  {
    sequelize: connection,
    tableName: "reports",
    timestamps: false,
    modelName: 'Report'
  }
);

export class ReportActions {

  
      /**
       * Obtiene todas las reportes de la base de datos.
       * @returns promise con un array de objetos ReportAttributes.
       */
      public static async getAll(): Promise<ReportAttributes[]> {
          const reports = await ReportModel.findAll({ include: REPORT_INCLUDE_CONFIG });
          return reports.map(report => report.get({ plain: true }));
      }
  
      /**
       * obtiene un reporte que cumpla con los criterios de búsqueda proporcionados.
       * @param data criterios de búsqueda.
       * @returns promise con un objeto ReportAttributes o null si no se encuentra ningun reporte.
       */
      public static async getOne(data: ReportSearchData): Promise<ReportAttributes | null> {
        const report = await ReportModel.findOne({ where: data, include: REPORT_INCLUDE_CONFIG});
        return report ? report.get({ plain: true }) : null;
      }
  
      /**
       * Crea un nuevo reporte en la base de datos.
       * @param data datos de la reporte a crear.
       * @returns promise con el objeto ReportAttributes creado.
       */
      public static async create(data: ReportCreationAttributes): Promise<ReportAttributes> {
        return connection.transaction(async (t) => {
          // Verificar si ya existe un reporte para la semana dada
          const existingReport = await ReportModel.findOne({ where: { week_id: data.week_id }, transaction: t });
          if (existingReport) {
              throw new Error(`Ya existe un reporte para la semana con ID ${data.week_id}`);
          }
  
          const newReport = await ReportModel.create(data, { transaction: t });
          return newReport.get({ plain: true });
        });
      }
  
      /**
       * Elimina un reporte de la base de datos por su ID.
       * @param data criterios de búsqueda para la reporte a eliminar.
       * @returns promise con un booleano que indica si la eliminación fue exitosa.
       */
      public static async delete(data: ReportSearchData): Promise<boolean> {
          const deletedCount = await ReportModel.destroy({ where: data });
          return deletedCount > 0;
      }
  
      /**
       * Actualiza un reporte existente en la base de datos.
       * @param id ID de la reporte a actualizar.
       * @param data datos a actualizar.
       * @returns promise con un booleano que indica si la actualización fue exitosa.
       */
      public static async update(id: number, data: Partial<ReportCreationAttributes>): Promise<ReportAttributes | null> {
        return connection.transaction(async (t) => {

          const [updatedCount] = await ReportModel.update(data, { where: { id }, transaction: t });
          if(updatedCount === 0) {
              return null;
          }
          const updatedReport = await ReportModel.findByPk(id, { transaction: t });
          return updatedReport ? updatedReport.get({ plain: true }) : null;
        });
      }

      /**
       * Crea o actualiza un reporte en la base de datos.
       * @param data Datos del reporte.
       * @returns El reporte actualizado o creado.
       */
      public static async upsert(data: ReportCreationAttributes): Promise<ReportAttributes> {
        const [report] = await ReportModel.upsert(data);
        return report.get({ plain: true });
      }
}