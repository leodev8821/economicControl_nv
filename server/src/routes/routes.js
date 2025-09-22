import { Router } from "express";
import { decodeUser, verifyLogin, verifySudoRole } from "../middlewares/decode.middleware.js";
import cashesController from "../controllers/cashes.controller.js";
import incomesController from "../controllers/incomes.controller.js";
import outcomesController from "../controllers/outcomes.controller.js";
import personsController from "../controllers/persons.controller.js";
import reportsController from "../controllers/reports.controller.js";
//import rolesController from "../controllers/roles.controller.js";
import usersController from "../controllers/users.controller.js";
import weeksController from "../controllers/weeks.controller.js";

const router = Router();

// Login route
router.post('/login', usersController.loginUser);


// Rutas para cajas
router.get('/cashes', decodeUser, verifyLogin, cashesController.allCash);
router.get('/cashes/:id', decodeUser, verifyLogin,  cashesController.oneCash);
router.post('/cashes/new-cash', decodeUser, verifyLogin, cashesController.createCash);
router.put('/cashes/:id', decodeUser, verifyLogin, cashesController.updateCash);
router.delete('/cashes/:id', decodeUser, verifyLogin, cashesController.deleteCash);

// Rutas para ingresos
router.get('/incomes', decodeUser, verifyLogin, incomesController.allIncomes);
router.get('/incomes/:id', decodeUser, verifyLogin, incomesController.oneIncome);
router.post('/incomes', decodeUser, verifyLogin, incomesController.createIncome);
router.put('/incomes/:id', decodeUser, verifyLogin, incomesController.updateIncome);
router.delete('/incomes/:id', decodeUser, verifyLogin, incomesController.deleteIncome);
router.get('/incomes/tithe/:dni', decodeUser, verifyLogin, incomesController.titheByPerson);

// Rutas para gastos
router.get('/outcomes', decodeUser, verifyLogin, outcomesController.allOutcomes);
router.get('/outcomes/:id', decodeUser, verifyLogin, outcomesController.oneOutcome);
router.post('/outcomes', decodeUser, verifyLogin, outcomesController.createOutcome);
router.put('/outcomes/:id', decodeUser, verifyLogin, outcomesController.updateOutcome);
router.delete('/outcomes/:id', decodeUser, verifyLogin, outcomesController.deleteOutcome);
router.get('/outcomes/cash/:cash_id', decodeUser, verifyLogin, outcomesController.outcomesByCash);

// Rutas para personas
router.get('/persons', decodeUser, verifyLogin, personsController.allPersons);
router.get('/persons/:id', decodeUser, verifyLogin, personsController.onePerson);
router.post('/persons', decodeUser, verifyLogin, personsController.createPerson);
router.put('/persons/:id', decodeUser, verifyLogin, personsController.updatePerson);
router.delete('/persons/:id', decodeUser, verifyLogin, personsController.deletePerson);

// Rutas para reportes
router.get('/reports', decodeUser, verifyLogin, reportsController.allReports);
router.get('/reports/:id', decodeUser, verifyLogin, reportsController.oneReport);
router.post('/reports', decodeUser, verifyLogin, reportsController.createReport);
router.put('/reports/:id', decodeUser, verifyLogin, reportsController.updateReport);
router.delete('/reports/:id', decodeUser, verifyLogin, reportsController.deleteReport);
router.get('/reports/week/:week_start', decodeUser, verifyLogin, reportsController.reportByWeek);

// Rutas para roles
//router.get('/roles', rolesController.allRoles);

// Rutas para usuarios
router.get('/users', decodeUser, verifySudoRole, usersController.allUsers);
router.get('/users/:id', decodeUser, verifySudoRole, usersController.oneUser);
router.post('/users/new-user', decodeUser, verifySudoRole, usersController.createUser);
router.put('/users/:id', decodeUser, verifySudoRole, usersController.updateUser);
router.delete('/users/:id', decodeUser, verifySudoRole, usersController.deleteUser);

// Rutas para semanas
router.get('/weeks', decodeUser, verifyLogin, weeksController.getWeekData);
router.post('/weeks/gen', decodeUser, verifyLogin, weeksController.generateWeeks);
router.get('/weeks/year/:year', decodeUser, verifyLogin, weeksController.getWeeksByYear);

export { router };