import { getSequelizeConfig } from "../config/sequelize.config.js";
import { RoleModel as Role } from "./auth/role.model.js";
import { UserModel as User } from "./auth/user.model.js";
import { ApplicationModel as Application } from "./auth/application.model.js";
import { UserPermissionModel as UserPermission } from "./auth/user-permission.model.js";
import { ConsolidationModel as Consolidation } from "./consolidation-app/consolidation.model.js";
import { NetworkModel as Network } from "./consolidation-app/network.model.js";
import { MemberRegisterModel as MemberRegister } from "./consolidation-app/member-register.model.js";
import { CashModel as Cash } from "./finance-app/cash.model.js";
import { IncomeModel as Income } from "./finance-app/income.model.js";
import { OutcomeModel as Outcome } from "./finance-app/outcome.model.js";
import { PersonModel as Person } from "./finance-app/person.model.js";
import { ReportModel as Report } from "./finance-app/report.model.js";
import { WeekModel as Week } from "./finance-app/week.model.js";
import { CashDenominationModel as CashDenomination } from "./finance-app/cash-denomination.model.js";

// =================================================================
// 🔗 DEFINICIÓN DE ASOCIACIONES
// =================================================================
export const sequelizeInstance = getSequelizeConfig();

// =================================================================
// 🔐 Sistema de Permisos Multi-App (Auth Core)
// =================================================================

/**
 * RELACIÓN MUCHOS A MUCHOS: User <-> Application
 * Un usuario puede acceder a varias aplicaciones, y una aplicación tiene varios usuarios.
 * La tabla 'UserPermission' actúa como pivot y define el rol específico en cada app.
 */
User.belongsToMany(Application, {
  through: UserPermission,
  foreignKey: "user_id",
  otherKey: "application_id",
  as: "Applications",
});

Application.belongsToMany(User, {
  through: UserPermission,
  foreignKey: "application_id",
  otherKey: "user_id",
  as: "Users",
});

// Relaciones directas con la tabla de permisos
UserPermission.belongsTo(User, { foreignKey: "user_id", as: "User" });
UserPermission.belongsTo(Application, {
  foreignKey: "application_id",
  as: "Application",
});
UserPermission.belongsTo(Role, {
  foreignKey: "role_id",
  targetKey: "id",
  as: "Role",
});

// --- User <-> Role ---
User.belongsTo(Role, {
  foreignKey: "role_name",
  targetKey: "role_name",
  as: "Role",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Role.hasMany(User, {
  foreignKey: "role_name",
  sourceKey: "role_name",
  as: "Users",
});

User.hasMany(UserPermission, { foreignKey: "user_id", as: "permissions" });

// =================================================================
// Consolidation App
// =================================================================

// --- Consolidation <-> MemberRegister ---
Consolidation.belongsTo(MemberRegister, {
  foreignKey: { name: "member_register_id", allowNull: true },
  as: "MemberRegister",
  onDelete: "SET NULL",
});

MemberRegister.hasMany(Consolidation, {
  foreignKey: { name: "member_register_id", allowNull: true },
  as: "Consolidations",
});

// --- Consolidation <-> Leader ---
Consolidation.belongsTo(User, {
  foreignKey: { name: "leader_id", allowNull: true },
  as: "Leader",
});

User.hasMany(Consolidation, {
  foreignKey: { name: "leader_id", allowNull: true },
  as: "Consolidations",
});

// --- Consolidation <-> Network ---
Consolidation.belongsTo(Network, {
  foreignKey: { name: "network_id", allowNull: true },
  as: "Network",
});

Network.hasMany(Consolidation, {
  foreignKey: { name: "network_id", allowNull: true },
  as: "Consolidations",
});

// =================================================================
// Finance App
// =================================================================

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

// --- Report <-> Week (One-to-One) ---
Report.belongsTo(Week, {
  foreignKey: { name: "week_id", allowNull: false },
  as: "Week",
});

Week.hasOne(Report, {
  foreignKey: { name: "week_id", allowNull: false },
  onDelete: "CASCADE",
  as: "Report",
});

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
  Consolidation,
  Network,
  MemberRegister,
  Application,
  UserPermission,
};
