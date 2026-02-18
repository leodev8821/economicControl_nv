import { DataTypes, Model, type Optional } from "sequelize";
import { getSequelizeConfig } from "../../config/sequelize.config.js";

const connection = getSequelizeConfig();

// Interfaces para el modelo CashDenomination
export interface CashDenominationAttributes {
  id: number;
  cash_id: number;
  denomination_value: number;
  quantity: number;
}

// Tipo para criterios de búsqueda simple
export type CashDenominationSearchData = {
  id?: number;
  cash_id?: number;
  denomination_value?: number;
};

// Opcionalidad para la creación (id es auto-generado, quantity tiene un valor por defecto)
export interface CashDenominationCreationAttributes extends Optional<
  CashDenominationAttributes,
  "id"
> {}

// Definición del modelo con tipado
export class CashDenominationModel
  extends Model<CashDenominationAttributes, CashDenominationCreationAttributes>
  implements CashDenominationAttributes
{
  declare id: number;
  declare cash_id: number;
  declare denomination_value: number;
  declare quantity: number;
}

// Inicialización del modelo
CashDenominationModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cash_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "cashes",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    denomination_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
  },
  {
    sequelize: connection,
    tableName: "cash_denominations",
    timestamps: false,
    modelName: "CashDenomination",
    indexes: [
      {
        unique: true,
        fields: ["cash_id", "denomination_value"],
      },
    ],
  },
);
