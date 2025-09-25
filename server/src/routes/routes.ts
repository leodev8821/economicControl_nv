import { Router } from "express";

// --- MIDDLEWARES ---
// Asumo que estos son módulos .ts/.js
import { decodeUser, verifyLogin, verifySudoRole } from "../middlewares/decode.middleware";

// --- CONTROLLERS ---
import { cashesController } from "../controllers/cashes.controller";
import * as incomesController from "../controllers/incomes.controller"; // Se importa como '*' porque son exports individuales
import { outcomesController } from "../controllers/outcomes.controller";
import { personController } from "../controllers/persons.controller";
import { reportsController } from "../controllers/reports.controller";
import { rolesController } from "../controllers/roles.controller";
import { usersController } from "../controllers/users.controller";
import { weeksController } from "../controllers/weeks.controller";

const router: Router = Router();

// =================================================================
// 🔑 LOGIN
// =================================================================
router.post('/login', usersController.loginUser);

// =================================================================
// 💰 CAJAS (CASHES)
// Se usa :id/:name para permitir buscar por ambos en la URL
// =================================================================
router.get('/cashes', decodeUser, verifyLogin, cashesController.allCash);
router.get('/cashes/:id', decodeUser, verifyLogin, cashesController.oneCash);
// El controller oneCash maneja la lógica de buscar por id o name a través de req.params
router.get('/cashes/name/:name', decodeUser, verifyLogin, cashesController.oneCash); 
router.post('/cashes/new-cash', decodeUser, verifyLogin, cashesController.createCash);
router.put('/cashes/:id', decodeUser, verifyLogin, cashesController.updateCash);
router.delete('/cashes/:id', decodeUser, verifyLogin, cashesController.deleteCash);

// =================================================================
// 💵 INGRESOS (INCOMES)
// El controller de incomes usa exports individuales (allIncomes, oneIncome, etc.)
// =================================================================
router.get('/incomes', decodeUser, verifyLogin, incomesController.allIncomes);
router.get('/incomes/:id', decodeUser, verifyLogin, incomesController.oneIncome);
router.post('/incomes/new-income', decodeUser, verifyLogin, incomesController.createIncome);
router.put('/incomes/:id', decodeUser, verifyLogin, incomesController.updateIncome);
router.delete('/incomes/:id', decodeUser, verifyLogin, incomesController.deleteIncome);
router.get('/incomes/tithe/:dni', decodeUser, verifyLogin, incomesController.titheByPerson);
router.get('/incomes/date/:date', decodeUser, verifyLogin, incomesController.getIncomesByDate);


// =================================================================
// 💳 GASTOS (OUTCOMES)
// =================================================================
router.get('/outcomes', decodeUser, verifyLogin, outcomesController.allOutcomes);
router.get('/outcomes/:id', decodeUser, verifyLogin, outcomesController.oneOutcome);
router.post('/outcomes', decodeUser, verifyLogin, outcomesController.createOutcome);
router.put('/outcomes/:id', decodeUser, verifyLogin, outcomesController.updateOutcome);
router.delete('/outcomes/:id', decodeUser, verifyLogin, outcomesController.deleteOutcome);
router.get('/outcomes/cash/:cash_id', decodeUser, verifyLogin, outcomesController.outcomesByCash);

// =================================================================
// 🧑 PERSONAS (PERSONS)
// Se usa :id/:dni para buscar por ambos
// =================================================================
router.get('/persons', decodeUser, verifyLogin, personController.allPersons);
router.get('/persons/:id', decodeUser, verifyLogin, personController.onePerson);
router.get('/persons/dni/:dni', decodeUser, verifyLogin, personController.onePerson);
router.post('/persons', decodeUser, verifyLogin, personController.createPerson);
// Se puede actualizar por id o dni
router.put('/persons/:id', decodeUser, verifyLogin, personController.updatePerson);
router.put('/persons/dni/:dni', decodeUser, verifyLogin, personController.updatePerson);
// Se puede eliminar por id o dni
router.delete('/persons/:id', decodeUser, verifyLogin, personController.deletePerson);
router.delete('/persons/dni/:dni', decodeUser, verifyLogin, personController.deletePerson);


// =================================================================
// 📄 REPORTES (REPORTS)
// =================================================================
router.get('/reports', decodeUser, verifyLogin, reportsController.allReports);
router.get('/reports/:id', decodeUser, verifyLogin, reportsController.oneReport);
router.post('/reports', decodeUser, verifyLogin, reportsController.createReport);
router.put('/reports/:id', decodeUser, verifyLogin, reportsController.updateReport);
router.delete('/reports/:id', decodeUser, verifyLogin, reportsController.deleteReport);
// Nota: La ruta original usaba :week_start. Usaré :week_id para ser más consistente con el controller.
router.get('/reports/week/:week_id', decodeUser, verifyLogin, reportsController.reportByWeek);


// =================================================================
// 👤 ROLES (ROLES)
// =================================================================
router.get('/roles', decodeUser, verifyLogin, rolesController.allRoles);


// =================================================================
// 👨‍💻 USUARIOS (USERS)
// Requiere verifySudoRole
// =================================================================
router.get('/users', decodeUser, verifySudoRole, usersController.allUsers);
router.get('/users/:id', decodeUser, verifySudoRole, usersController.oneUser);
router.post('/users/new-user', decodeUser, verifySudoRole, usersController.createUser);
router.put('/users/:id', decodeUser, verifySudoRole, usersController.updateUser);
router.delete('/users/:id', decodeUser, verifySudoRole, usersController.deleteUser);

// =================================================================
// 📅 SEMANAS (WEEKS)
// =================================================================
// Nota: getWeekData usa :weekId en el controller, la ruta original era ambigua,
// la renombro para usar el ID.
router.get('/weeks/:weekId', decodeUser, verifyLogin, weeksController.getWeekData);
router.post('/weeks/gen', decodeUser, verifyLogin, weeksController.generateWeeks);
router.get('/weeks/year/:year', decodeUser, verifyLogin, weeksController.getWeeksByYear);

export default router;