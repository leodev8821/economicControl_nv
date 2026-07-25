import { DataTypes, Model, type Optional } from "sequelize";
import { getSequelizeConfig } from "@config/sequelize.config.js";
import { PAYMENT_METHODS, type PaymentMethod } from "@economic-control/shared";

const connection = getSequelizeConfig();

// Interfaces para el modelo Bill
export interface BillAttributes {
  id: number;
  date: Date;
  amount: number;
  pay_method: PaymentMethod;
  created_at: Date
}

// Tipo para criterios de búsqueda simple
export type BillSearchData = {
  id?: number;
  amount?: number;
  pay_method?: PaymentMethod;
};

// Opcionalidad para la creación (id es auto-generado)
export interface BillCreationAttributes
  extends Optional<BillAttributes, "id"> { }

// Definición del modelo con tipado
export class BillModel
  extends Model<BillAttributes, BillCreationAttributes>
  implements BillAttributes {
  declare id: number;
  declare date: Date;
  declare amount: number;
  declare pay_method: PaymentMethod;
  declare created_at: Date
}

// Inicialización del modelo
BillModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    date: {
        type: DataTypes.DATE()
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.0,
      set(value) {
        // Forzamos que siempre se guarde como número
        this.setDataValue("amount", parseFloat(String(value)));
      },
    },
    pay_method: {
        type: DataTypes.ENUM(...PAYMENT_METHODS),
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE(),
        defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize: connection,
    tableName: "bills",
    timestamps: false,
    modelName: "Bill",
  },
);