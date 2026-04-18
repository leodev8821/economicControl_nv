import { DataTypes, Model, type Optional } from "sequelize";
import { getSequelizeConfig } from "@config/sequelize.config.js";
import { CashDenominationModel } from "./cash-denomination.model.js";

const connection = getSequelizeConfig();

// Interfaces para el modelo Cash
export interface CashAttributes {
  id: number;
  name: string;
  actual_amount: number;
  denominations?: CashDenominationModel[];
}

// Tipo para criterios de búsqueda simple
export type CashSearchData = {
  id?: number;
  name?: string;
};

// Opcionalidad para la creación (id es auto-generado)
export interface CashCreationAttributes
  extends Optional<CashAttributes, "id"> { }

// Definición del modelo con tipado
export class CashModel
  extends Model<CashAttributes, CashCreationAttributes>
  implements CashAttributes {
  declare id: number;
  declare name: string;
  declare actual_amount: number;
  declare denominations?: CashDenominationModel[];
}

// Inicialización del modelo
CashModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    actual_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.0,
      set(value) {
        // Forzamos que siempre se guarde como número
        this.setDataValue("actual_amount", parseFloat(String(value)));
      },
    },
  },
  {
    sequelize: connection,
    tableName: "cashes",
    timestamps: false,
    modelName: "Cash",
  },
);