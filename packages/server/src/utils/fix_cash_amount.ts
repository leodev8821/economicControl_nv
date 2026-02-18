import { getSequelizeConfig } from "../config/sequelize.config.js";
// Importamos los modelos después de la config
import { CashModel } from "../models/finance-app/cash.model.js";
import { IncomeModel } from "../models/finance-app/income.model.js";
import { OutcomeModel } from "../models/finance-app/outcome.model.js";

const connection = getSequelizeConfig();

/**
 * Sincroniza el saldo actual de todas las cajas basándose
 * en el historial real de movimientos.
 */
export async function syncAllBalances(): Promise<void> {
  // Aseguramos que la conexión esté lista
  await connection.authenticate();

  return connection.transaction(async (t) => {
    const cashes = await CashModel.findAll({ transaction: t });

    for (const cash of cashes) {
      // 1. Sumar todos los ingresos de esta caja
      const totalIncomes =
        (await IncomeModel.sum("amount", {
          where: { cash_id: cash.id },
          transaction: t,
        })) || 0;

      // 2. Sumar todos los egresos de esta caja
      const totalOutcomes =
        (await OutcomeModel.sum("amount", {
          where: { cash_id: cash.id },
          transaction: t,
        })) || 0;

      // 3. El saldo real matemático
      const realBalance =
        parseFloat(String(totalIncomes)) - parseFloat(String(totalOutcomes));

      // 4. Actualizar la caja con el valor corregido
      await cash.update({ actual_amount: realBalance }, { transaction: t });

      console.log(
        `Caja "${cash.name}" sincronizada. Nuevo saldo: ${realBalance}€`,
      );
    }
  });
}
