import type { Transaction } from "sequelize";
import { getSequelizeConfig } from "../config/sequelize.config.js";

type TransactionCallback<T> = (transaction: Transaction) => Promise<T>;

export async function withTransaction<T>(
  callback: TransactionCallback<T>,
): Promise<T> {
  const sequelize = getSequelizeConfig();
  const transaction = await sequelize.transaction();

  try {
    const result = await callback(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
