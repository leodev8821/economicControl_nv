import { getSequelizeConfig } from "../../config/sequelize.config.js";
import { ConsolidationModel as Consolidation } from "./consolidacion.model.js";
import { LeaderModel as Leader } from "./leader.model.js";
import { NetworkModel as Network } from "./network.model.js";
import { MemberRegisterModel as Register } from "./member-register.model.js";

// =================================================================
// 🔗 DEFINICIÓN DE ASOCIACIONES
// Se utiliza el patrón de alias 'as' para los Scopes y los Includes.
// =================================================================
export const sequelizeInstance = getSequelizeConfig();

// --- Consolidation <-> Register (Persona) ---
// Una consolidación pertenece a un registro específico.
Consolidation.belongsTo(Register, {
  foreignKey: { name: "member_register_id", allowNull: true },
  as: "MemberRegister",
  onDelete: "SET NULL",
});

Register.hasMany(Consolidation, {
  foreignKey: { name: "member_register_id", allowNull: true },
  as: "Consolidations",
});

// --- Consolidation <-> Lider ---
// Una consolidación es gestionada por un líder.
Consolidation.belongsTo(Leader, {
  foreignKey: { name: "leader_id", allowNull: false },
  as: "Leader",
});

Leader.hasMany(Consolidation, {
  foreignKey: { name: "leader_id", allowNull: false },
  as: "Consolidations",
});

// --- Consolidation <-> Red ---
// Una consolidación pertenece a una red.
Consolidation.belongsTo(Network, {
  foreignKey: { name: "network_id", allowNull: false },
  as: "Network",
});

Network.hasMany(Consolidation, {
  foreignKey: { name: "network_id", allowNull: false },
  as: "Consolidations",
});

// Exportar los modelos con sus nombres simples (aliaseados)
export { Consolidation, Leader as Lider, Network as Red, Register };
