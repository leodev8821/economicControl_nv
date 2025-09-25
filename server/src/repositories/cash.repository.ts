import { CashModel, CashAttributes, CashCreationAttributes } from '../models/cash.model';
import { Op } from "sequelize";

// Tipos auxiliares
type CreateCashData = CashCreationAttributes;
type UpdateCashData = Partial<CashCreationAttributes>;
type CashSearchData = { id?: number; name?: string };

/**
 * Repositorio de Cajas, maneja las interacciones con la base de datos.
 */
export class CashRepository {

    /**
     * Obtiene todas las cajas.
     */
    public static async getAll(): Promise<CashAttributes[]> {
        const cashes = await CashModel.findAll();
        return cashes.map(cash => cash.get({ plain: true }));
    }

    /**
     * Obtiene una caja por ID o nombre.
     */
    public static async getOne(data: CashSearchData): Promise<CashAttributes | null> {
        const cash = await CashModel.findOne({ where: data });
        return cash ? cash.get({ plain: true }) : null;
    }

    /**
     * Crea una nueva caja.
     */
    public static async create(data: CreateCashData): Promise<CashAttributes> {
        const newCash = await CashModel.create(data);
        return newCash.get({ plain: true });
    }

    /**
     * Actualiza una caja por ID.
     */
    public static async update(id: number, data: UpdateCashData): Promise<CashAttributes | null> {
        const [affectedRows] = await CashModel.update(data, { where: { id } });
        if (affectedRows === 0) {
            return null;
        }
        const updatedCash = await CashModel.findByPk(id);
        return updatedCash ? updatedCash.get({ plain: true }) : null;
    }

    /**
     * Elimina una caja por ID o nombre.
     */
    public static async delete(data: CashSearchData): Promise<boolean> {
        const affectedRows = await CashModel.destroy({ where: data });
        return affectedRows > 0;
    }
}