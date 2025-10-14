import { ReportModel, ReportAttributes, ReportCreationAttributes } from '../models/report.model';
import { WeekModel } from '../models/week.model';

// Tipos auxiliares
type CreateReportData = ReportCreationAttributes;
type UpdateReportData = Partial<ReportCreationAttributes>;

// 💡 Constante para la configuración de inclusión (JOINs)
const REPORT_INCLUDE_CONFIG = [
    {
        model: WeekModel, 
        as: 'Week',
        attributes: ['id', 'week_start', 'week_end'],
        required: true,
    }
];

/**
 * Repositorio de Informes, maneja las interacciones con la base de datos.
 */
export class ReportRepository {

    /**
     * Obtiene todos los informes.
     */
    public static async getAll(): Promise<ReportAttributes[]> {
        const reports = await ReportModel.findAll({
            include: REPORT_INCLUDE_CONFIG,
        });
        return reports.map(report => report.get({ plain: true }));
    }

    /**
     * Obtiene un informe por ID.
     */
    public static async getOneById(id: number): Promise<ReportAttributes | null> {
        const report = await ReportModel.findByPk(id, { 
            include: REPORT_INCLUDE_CONFIG,
        });
        return report ? report.get({ plain: true }) : null;
    }

    /**
     * Obtiene un informe por el ID de la semana.
     */
    public static async getOneByWeekId(weekId: number): Promise<ReportAttributes | null> {
        const report = await ReportModel.findOne({ 
            where: { week_id: weekId },
            include: REPORT_INCLUDE_CONFIG,
        });
        return report ? report.get({ plain: true }) : null;
    }

    /**
     * Crea un nuevo informe.
     */
    public static async create(data: CreateReportData): Promise<ReportAttributes> {
        const newReport = await ReportModel.create(data);
        return newReport.get({ plain: true });
    }

    /**
     * Actualiza un informe por ID.
     */
    public static async update(id: number, data: UpdateReportData): Promise<ReportAttributes | null> {
        const [affectedRows] = await ReportModel.update(data, { where: { id } });
        if (affectedRows === 0) {
            return null;
        }
        const updatedReport = await ReportModel.findByPk(id. {
            include: REPORT_INCLUDE_CONFIG,
        });
        return updatedReport ? updatedReport.get({ plain: true }) : null;
    }

    /**
     * Elimina un informe por ID.
     */
    public static async delete(id: number): Promise<boolean> {
        const affectedRows = await ReportModel.destroy({ where: { id } });
        return affectedRows > 0;
    }
}