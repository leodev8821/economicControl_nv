import { Router } from "express";
import authRouter from "../auth/auth.routes.js";

// --- MIDDLEWARES ---
import { decodeAccessToken, requireRole } from "../auth/auth.middleware.js";

// --- CONTROLLERS ---
import { cashesController } from "../controllers/cashes.controller.js";
import { dashboardController } from "../controllers/dashboard.controller.js";
import { incomesController } from "../controllers/incomes.controller.js";
import { outcomesController } from "../controllers/outcomes.controller.js";
import { personsController } from "../controllers/persons.controller.js";
import { reportsController } from "../controllers/reports.controller.js";
import { rolesController } from "../controllers/roles.controller.js";
import { weeksController } from "../controllers/weeks.controller.js";
import { cashDenominationController } from "../controllers/cash-denomination.controller.js";
import { usersController } from "../controllers/users.controller.js";

const router: Router = Router();

// =================================================================
// 🔑 LOGIN
// =================================================================
router.use("/auth", authRouter);

// =================================================================
// 🔐 MIDDLEWARES
// =================================================================
router.use(decodeAccessToken);

// =================================================================
// 👨‍💻 USERS (ADMIN)
// =================================================================
router.get(
  "/users",
  requireRole("SuperUser", "Administrador"),
  usersController.allUsers,
);
router.get(
  "/users/:id",
  requireRole("SuperUser", "Administrador"),
  usersController.oneUser,
);
router.post(
  "/users",
  requireRole("SuperUser", "Administrador"),
  usersController.createUser,
);
router.put(
  "/users/:id",
  requireRole("SuperUser", "Administrador"),
  usersController.updateUser,
);
router.delete(
  "/users/:id",
  requireRole("SuperUser", "Administrador"),
  usersController.deleteUser,
);

// =================================================================
// 👤 ROLES (ADMIN)
// =================================================================
router.get(
  "/roles",
  requireRole("SuperUser", "Administrador"),
  rolesController.allRoles,
);

// =================================================================
// 💰 CAJAS (CASHES)
// Se usa :id/:name para permitir buscar por ambos en la URL
// =================================================================
router.get("/cashes", cashesController.allCash);
router.get("/cashes/:id", cashesController.oneCash);
router.get("/cashes/name/:name", cashesController.oneCash);
router.post("/cashes/new-cash", cashesController.createCash);
router.put("/cashes/:id", cashesController.updateCash);
router.delete("/cashes/:id", cashesController.deleteCash);

// =================================================================
// 💵 INGRESOS (INCOMES)
// El controller de incomes usa exports individuales (allIncomes, oneIncome, etc.)
// =================================================================
router.get("/incomes", incomesController.allIncomes);
router.get("/incomes/:id", incomesController.oneIncome);
router.post("/incomes/new-income", incomesController.createIncome);
router.post("/incomes/bulk-incomes", incomesController.createBulkIncomes);
router.put("/incomes/:id", incomesController.updateIncome);
router.delete("/incomes/:id", incomesController.deleteIncome);
router.get("/incomes/tithe/:dni", incomesController.titheByPerson);
router.get("/incomes/date/:date", incomesController.getIncomesByDate);

// =================================================================
// 💳 GASTOS (OUTCOMES)
// =================================================================
router.get("/outcomes", outcomesController.allOutcomes);
router.get("/outcomes/:id", outcomesController.oneOutcome);
router.post("/outcomes/new-outcome", outcomesController.createOutcome);
router.post("/outcomes/bulk-outcomes", outcomesController.createBulkOutcomes);
router.put("/outcomes/:id", outcomesController.updateOutcome);
router.delete("/outcomes/:id", outcomesController.deleteOutcome);
router.get("/outcomes/cash/:cash_id", outcomesController.outcomesByCash);

// =================================================================
// 🧑 PERSONAS (PERSONS)
// Se usa :id/:dni para buscar por ambos
// =================================================================
router.get("/persons", personsController.allPersons);
router.get("/persons/:id", personsController.onePerson);
router.get("/persons/dni/:dni", personsController.onePerson);
router.post("/persons/new-person", personsController.createPerson);
// Se puede actualizar por id o dni
router.put("/persons/:id", personsController.updatePerson);
router.put("/persons/dni/:dni", personsController.updatePerson);
// Se puede eliminar por id o dni
router.delete("/persons/:id", personsController.deletePerson);
router.delete("/persons/dni/:dni", personsController.deletePerson);

// =================================================================
// 📄 REPORTES (REPORTS)
// =================================================================
router.get("/reports", reportsController.allReports);
router.get("/reports/:id", reportsController.oneReport);
router.get("/reports/week/:week_id", reportsController.oneReport);
router.post("/create-report", reportsController.createReport);
router.put("/reports/:id", reportsController.updateReport);
router.delete("/reports/:id", reportsController.deleteReport);

// =================================================================
// 📄 BALANCE
// =================================================================
router.get("/balance/get-balance", dashboardController.getBalance);

// =================================================================
// 💰 MONEDAS (CASH DENOMINATIONS)
// =================================================================
router.get(
  "/cash-denominations",
  cashDenominationController.allCashDenominations,
);
router.get(
  "/cash-denominations/:id",
  cashDenominationController.oneCashDenomination,
);
router.post(
  "/cash-denominations/new-cash-denomination",
  cashDenominationController.createCashDenomination,
);
router.put(
  "/cash-denominations/:id",
  cashDenominationController.updateCashDenomination,
);
router.delete(
  "/cash-denominations/:id",
  cashDenominationController.deleteCashDenomination,
);

// =================================================================
// 📅 SEMANAS (WEEKS)
// =================================================================
router.get("/weeks", weeksController.allWeeks);
router.get("/weeks/:weekId", weeksController.oneWeek);
router.post("/weeks/gen", weeksController.generateWeeks);
router.get("/weeks/year/:year", weeksController.getWeeksByYear);

export default router;
