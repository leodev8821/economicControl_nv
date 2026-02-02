import { getSequelizeConfig } from "../../config/sequelize.config.js";
import { ConsolidationModel as Consolidation } from "./consolidacion.model.js";
import { LiderModel as Lider } from "./leader.model.js";
import { RedModel as Red } from "./red.model.js";
import { RegisterModel as Register } from "./registro-persona.model.js";

// =================================================================
// 🔗 DEFINICIÓN DE ASOCIACIONES
// Se utiliza el patrón de alias 'as' para los Scopes y los Includes.
// =================================================================
export const sequelizeInstance = getSequelizeConfig();

// --- Consolidation <-> Register (Persona) ---
// Una consolidación pertenece a un registro específico.
Consolidation.belongsTo(Register, {
  foreignKey: { name: "register_id", allowNull: true },
  as: "Register",
  onDelete: "SET NULL",
});

Register.hasMany(Consolidation, {
  foreignKey: { name: "register_id", allowNull: true },
  as: "Consolidations",
});

// --- Consolidation <-> Lider ---
// Una consolidación es gestionada por un líder.
Consolidation.belongsTo(Lider, {
  foreignKey: { name: "lider_id", allowNull: false },
  as: "Lider",
});

Lider.hasMany(Consolidation, {
  foreignKey: { name: "lider_id", allowNull: false },
  as: "Consolidations",
});

// --- Consolidation <-> Red ---
// Una consolidación pertenece a una red.
Consolidation.belongsTo(Red, {
  foreignKey: { name: "red_id", allowNull: false },
  as: "Red",
});

Red.hasMany(Consolidation, {
  foreignKey: { name: "red_id", allowNull: false },
  as: "Consolidations",
});

// Exportar los modelos con sus nombres simples (aliaseados)
export { Consolidation, Lider, Red, Register };
