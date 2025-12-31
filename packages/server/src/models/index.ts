import { getSequelizeConfig } from "../config/sequelize.config.ts";
import { CashModel as Cash } from "./cash.model.ts";
import { IncomeModel as Income } from "./income.model.ts";
import { OutcomeModel as Outcome } from "./outcome.model.ts";
import { PersonModel as Person } from "./person.model.ts";
import { ReportModel as Report } from "./report.model.ts";
import { RoleModel as Role } from "./role.model.ts";
import { UserModel as User } from "./user.model.ts";
import { WeekModel as Week } from "./week.model.ts";
import { CashDenominationModel as CashDenomination } from "./cash-denomination.model.ts";

// =================================================================
// 🔗 DEFINICIÓN DE ASOCIACIONES
// Se añade el alias 'as' para mejorar la inferencia de tipos de TypeScript
// y la claridad al incluir las relaciones.
// =================================================================
export const sequelizeInstance = getSequelizeConfig();

// --- Income <-> Person ---
Income.belongsTo(Person, {
  foreignKey: { name: "person_id", allowNull: false },
  as: "Person",
  onDelete: "CASCADE",
});

Person.hasMany(Income, {
  foreignKey: { name: "person_id", allowNull: false },
  onDelete: "CASCADE",
  as: "Incomes",
});

// --- Income <-> Week ---
Income.belongsTo(Week, {
  foreignKey: { name: "week_id", allowNull: false },
  as: "Week",
});

Week.hasMany(Income, {
  foreignKey: { name: "week_id", allowNull: false },
  onDelete: "CASCADE",
  as: "Incomes",
});

// --- Income <-> Cash ---
Income.belongsTo(Cash, {
  foreignKey: { name: "cash_id", allowNull: false },
  as: "Cash",
});

Cash.hasMany(Income, {
  foreignKey: { name: "cash_id", allowNull: false },
  onDelete: "CASCADE",
  as: "Incomes",
});

// --- Outcome <-> Cash ---
Outcome.belongsTo(Cash, {
  foreignKey: { name: "cash_id", allowNull: false },
  as: "Cash",
});

Cash.hasMany(Outcome, {
  foreignKey: { name: "cash_id", allowNull: false },
  onDelete: "CASCADE",
  as: "Outcomes",
});

// --- Outcome <-> Week ---
Outcome.belongsTo(Week, {
  foreignKey: { name: "week_id", allowNull: false },
  as: "Week",
});

Week.hasMany(Outcome, {
  foreignKey: { name: "week_id", allowNull: false },
  onDelete: "CASCADE",
  as: "Outcomes",
});

// --- User <-> Role ---
User.belongsTo(Role, {
  foreignKey: "role",
  targetKey: "role",
  as: "Role",
});

Role.hasMany(User, {
  foreignKey: "role",
  sourceKey: "role",
  onDelete: "CASCADE",
  as: "Users",
});

// --- Report <-> Week (One-to-One) ---
// El modelo Report ya tiene 'unique: true' en week_id
Report.belongsTo(Week, {
  foreignKey: { name: "week_id", allowNull: false },
  as: "Week",
});

Week.hasOne(Report, {
  foreignKey: { name: "week_id", allowNull: false },
  onDelete: "CASCADE",
  as: "Report",
});

// Exportar los modelos con sus nombres simples (aliaseados)
export {
  Cash,
  Income,
  Outcome,
  Person,
  Report,
  Role,
  User,
  Week,
  CashDenomination,
};
