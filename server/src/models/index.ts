import { CashModel as Cash } from "./cash.model";
import { IncomeModel as Income } from "./income.model";
import { OutcomeModel as Outcome } from "./outcome.model";
import { PersonModel as Person } from "./person.model";
import { ReportModel as Report } from "./report.model";
import { RoleModel as Role } from "./role.model";
import { UserModel as User } from "./user.model";
import { WeekModel as Week } from "./week.model";

// =================================================================
// 🔗 DEFINICIÓN DE ASOCIACIONES
// Se añade el alias 'as' para mejorar la inferencia de tipos de TypeScript
// y la claridad al incluir las relaciones.
// =================================================================

// --- Income <-> Person ---
Income.belongsTo(Person, {
  foreignKey: "person_id",
  as: 'Person',
});

Person.hasMany(Income, {
  foreignKey: "person_id",
  onDelete: "CASCADE",
  as: 'Incomes',
});

// --- Income <-> Week ---
Income.belongsTo(Week, {
  foreignKey: "week_id",
  as: 'Week',
});

Week.hasMany(Income, {
  foreignKey: "week_id",
  onDelete: "CASCADE",
  as: 'Incomes',
});

// --- Outcome <-> Cash ---
Outcome.belongsTo(Cash, {
  foreignKey: "cash_id",
  as: 'Cash',
});

Cash.hasMany(Outcome, {
  foreignKey: "cash_id",
  onDelete: "CASCADE",
  as: 'Outcomes',
});

// --- Outcome <-> Week ---
Outcome.belongsTo(Week, {
  foreignKey: "week_id",
  as: 'Week',
});

Week.hasMany(Outcome, {
  foreignKey: "week_id",
  onDelete: "CASCADE",
  as: 'Outcomes',
});

// --- User <-> Role ---
User.belongsTo(Role, {
  foreignKey: "role",
  targetKey: "role",
  as: 'Role',
});

Role.hasMany(User, {
  foreignKey: "role",
  sourceKey: "role",
  onDelete: "CASCADE",
  as: 'Users',
});

// --- Report <-> Week (One-to-One) ---
// El modelo Report ya tiene 'unique: true' en week_id
Report.belongsTo(Week, {
  foreignKey: "week_id",
  as: 'Week',
});

Week.hasOne(Report, {
  foreignKey: "week_id",
  onDelete: "CASCADE",
  as: 'Report',
});

// Exportar los modelos con sus nombres simples (aliaseados)
export { Cash, Income, Outcome, Person, Report, Role, User, Week };