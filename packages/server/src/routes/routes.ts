import { Router } from "express";
import authRouter from "./auth.routes.ts";

// --- MIDDLEWARES ---
import {
  decodeAccessToken,
  verifyLogin,
} from "../middlewares/decode.middleware.ts";

// --- CONTROLLERS ---
import { cashesController } from "../controllers/cashes.controller.ts";
import { dashboardController } from "../controllers/dashboard.controller.ts";
import { incomesController } from "../controllers/incomes.controller.ts";
import { outcomesController } from "../controllers/outcomes.controller.ts";
import { personsController } from "../controllers/persons.controller.ts";
import { reportsController } from "../controllers/reports.controller.ts";
import { rolesController } from "../controllers/roles.controller.ts";
import { weeksController } from "../controllers/weeks.controller.ts";
import { cashDenominationController } from "../controllers/cash-denomination.controller.ts";

const router: Router = Router();

// =================================================================
// 🔑 LOGIN
// =================================================================
router.use("/auth", authRouter);

// =================================================================
// 💰 CAJAS (CASHES)
// Se usa :id/:name para permitir buscar por ambos en la URL
// =================================================================
router.get("/cashes", decodeAccessToken, verifyLogin, cashesController.allCash);
router.get(
  "/cashes/:id",
  decodeAccessToken,
  verifyLogin,
  cashesController.oneCash
);
router.get(
  "/cashes/name/:name",
  decodeAccessToken,
  verifyLogin,
  cashesController.oneCash
);
router.post(
  "/cashes/new-cash",
  decodeAccessToken,
  verifyLogin,
  cashesController.createCash
);
router.put(
  "/cashes/:id",
  decodeAccessToken,
  verifyLogin,
  cashesController.updateCash
);
router.delete(
  "/cashes/:id",
  decodeAccessToken,
  verifyLogin,
  cashesController.deleteCash
);

// =================================================================
// 💵 INGRESOS (INCOMES)
// El controller de incomes usa exports individuales (allIncomes, oneIncome, etc.)
// =================================================================
router.get(
  "/incomes",
  decodeAccessToken,
  verifyLogin,
  incomesController.allIncomes
);
router.get(
  "/incomes/:id",
  decodeAccessToken,
  verifyLogin,
  incomesController.oneIncome
);
router.post(
  "/incomes/new-income",
  decodeAccessToken,
  verifyLogin,
  incomesController.createIncome
);
router.put(
  "/incomes/:id",
  decodeAccessToken,
  verifyLogin,
  incomesController.updateIncome
);
router.delete(
  "/incomes/:id",
  decodeAccessToken,
  verifyLogin,
  incomesController.deleteIncome
);
router.get(
  "/incomes/tithe/:dni",
  decodeAccessToken,
  verifyLogin,
  incomesController.titheByPerson
);
router.get(
  "/incomes/date/:date",
  decodeAccessToken,
  verifyLogin,
  incomesController.getIncomesByDate
);

// =================================================================
// 💳 GASTOS (OUTCOMES)
// =================================================================
router.get(
  "/outcomes",
  decodeAccessToken,
  verifyLogin,
  outcomesController.allOutcomes
);
router.get(
  "/outcomes/:id",
  decodeAccessToken,
  verifyLogin,
  outcomesController.oneOutcome
);
router.post(
  "/outcomes/new-outcome",
  decodeAccessToken,
  verifyLogin,
  outcomesController.createOutcome
);
router.put(
  "/outcomes/:id",
  decodeAccessToken,
  verifyLogin,
  outcomesController.updateOutcome
);
router.delete(
  "/outcomes/:id",
  decodeAccessToken,
  verifyLogin,
  outcomesController.deleteOutcome
);
router.get(
  "/outcomes/cash/:cash_id",
  decodeAccessToken,
  verifyLogin,
  outcomesController.outcomesByCash
);

// =================================================================
// 🧑 PERSONAS (PERSONS)
// Se usa :id/:dni para buscar por ambos
// =================================================================
router.get(
  "/persons",
  decodeAccessToken,
  verifyLogin,
  personsController.allPersons
);
router.get(
  "/persons/:id",
  decodeAccessToken,
  verifyLogin,
  personsController.onePerson
);
router.get(
  "/persons/dni/:dni",
  decodeAccessToken,
  verifyLogin,
  personsController.onePerson
);
router.post(
  "/persons/new-person",
  decodeAccessToken,
  verifyLogin,
  personsController.createPerson
);
// Se puede actualizar por id o dni
router.put(
  "/persons/:id",
  decodeAccessToken,
  verifyLogin,
  personsController.updatePerson
);
router.put(
  "/persons/dni/:dni",
  decodeAccessToken,
  verifyLogin,
  personsController.updatePerson
);
// Se puede eliminar por id o dni
router.delete(
  "/persons/:id",
  decodeAccessToken,
  verifyLogin,
  personsController.deletePerson
);
router.delete(
  "/persons/dni/:dni",
  decodeAccessToken,
  verifyLogin,
  personsController.deletePerson
);

// =================================================================
// 📄 REPORTES (REPORTS)
// =================================================================
router.get(
  "/reports",
  decodeAccessToken,
  verifyLogin,
  reportsController.allReports
);
router.get(
  "/reports/:id",
  decodeAccessToken,
  verifyLogin,
  reportsController.oneReport
);
router.get(
  "/reports/week/:week_id",
  decodeAccessToken,
  verifyLogin,
  reportsController.oneReport
);
router.post(
  "/create-report",
  decodeAccessToken,
  verifyLogin,
  reportsController.createReport
);
router.put(
  "/reports/:id",
  decodeAccessToken,
  verifyLogin,
  reportsController.updateReport
);
router.delete(
  "/reports/:id",
  decodeAccessToken,
  verifyLogin,
  reportsController.deleteReport
);

// =================================================================
// 📄 BALANCE
// =================================================================
router.get(
  "/balance/get-balance",
  decodeAccessToken,
  verifyLogin,
  dashboardController.getBalance
);

// =================================================================
// 👤 ROLES (ROLES)
// =================================================================
router.get("/roles", decodeAccessToken, verifyLogin, rolesController.allRoles);

// =================================================================
// 💰 MONEDAS (CURRENCY)
// =================================================================
router.get(
  "/currencies",
  decodeAccessToken,
  verifyLogin,
  cashDenominationController.allCashDenominations
);
router.get(
  "/currencies/:id",
  decodeAccessToken,
  verifyLogin,
  cashDenominationController.oneCashDenomination
);
router.post(
  "/currencies/new-currency",
  decodeAccessToken,
  verifyLogin,
  cashDenominationController.createCashDenomination
);
router.put(
  "/currencies/:id",
  decodeAccessToken,
  verifyLogin,
  cashDenominationController.updateCashDenomination
);
router.delete(
  "/currencies/:id",
  decodeAccessToken,
  verifyLogin,
  cashDenominationController.deleteCashDenomination
);

// =================================================================
// 📅 SEMANAS (WEEKS)
// =================================================================
router.get("/weeks", decodeAccessToken, verifyLogin, weeksController.allWeeks);
router.get(
  "/weeks/:weekId",
  decodeAccessToken,
  verifyLogin,
  weeksController.oneWeek
);
router.post(
  "/weeks/gen",
  decodeAccessToken,
  verifyLogin,
  weeksController.generateWeeks
);
router.get(
  "/weeks/year/:year",
  decodeAccessToken,
  verifyLogin,
  weeksController.getWeeksByYear
);

export default router;
