import { Router } from "express";
import cashesController from "../controllers/cashes.controller.js";
import incomesController from "../controllers/incomes.controller.js";
import outcomesController from "../controllers/outcomes.controller.js";
import personsController from "../controllers/persons.controller.js";
import reportsController from "../controllers/reports.controller.js";
import rolesController from "../controllers/roles.controller.js";
import usersController from "../controllers/users.controller.js";
import weeksController from "../controllers/weeks.controller.js";

const router = Router();

// Rutas para cajas
router.get('/cashes', cashesController.allCash);
router.get('/cashes/:id', cashesController.oneCash);
router.post('/cashes', cashesController.createCash);
router.put('/cashes/:id', cashesController.updateCash);
router.delete('/cashes/:id', cashesController.deleteCash);

// Rutas para ingresos
router.get('/incomes', incomesController.allIncomes);
router.get('/incomes/:id', incomesController.oneIncome);
router.post('/incomes', incomesController.createIncome);
router.put('/incomes/:id', incomesController.updateIncome);
router.delete('/incomes/:id', incomesController.deleteIncome);
router.get('/incomes/tithe/:dni', incomesController.titheByPerson);

// Rutas para gastos
router.get('/outcomes', outcomesController.allOutcomes);
router.get('/outcomes/:id', outcomesController.oneOutcome);
router.post('/outcomes', outcomesController.createOutcome);
router.put('/outcomes/:id', outcomesController.updateOutcome);
router.delete('/outcomes/:id', outcomesController.deleteOutcome);
router.get('/outcomes/cash/:cash_id', outcomesController.outcomesByCash);

// Rutas para personas
router.get('/persons', personsController.allPersons);
router.get('/persons/:id', personsController.onePerson);
router.post('/persons', personsController.createPerson);
router.put('/persons/:id', personsController.updatePerson);
router.delete('/persons/:id', personsController.deletePerson);

// Rutas para reportes
router.get('/reports', reportsController.allReports);
router.get('/reports/:id', reportsController.oneReport);
router.post('/reports', reportsController.createReport);
router.put('/reports/:id', reportsController.updateReport);
router.delete('/reports/:id', reportsController.deleteReport);
router.get('/reports/week/:week_start', reportsController.reportByWeek);

// Rutas para roles
router.get('/roles', rolesController.allRoles);

// Rutas para usuarios
router.get('/users', usersController.allUsers);
router.get('/users/:id', usersController.oneUser);
router.post('/users', usersController.createUser);
router.put('/users/:id', usersController.updateUser);
router.delete('/users/:id', usersController.deleteUser);

// Rutas para semanas
router.get('/weeks', weeksController.getWeekData);
router.post('/weeks/gen', weeksController.generateWeeks);
router.get('/weeks/year/:year', weeksController.getWeeksByYear);

export { router };