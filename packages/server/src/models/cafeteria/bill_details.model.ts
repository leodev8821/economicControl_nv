import { DataTypes, Model, type Optional } from "sequelize";
import { getSequelizeConfig } from "@config/sequelize.config.js";

const connection = getSequelizeConfig();

// Interfaces para el modelo BillDetail
export interface BillDetailAttributes {
  id: number;
  bill_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

// Tipo para criterios de búsqueda simple
export type BillDetailSearchData = {
  id?: number;
  bill_id?: number;
  subtotal?: number;
};

// Opcionalidad para la creación (id es auto-generado)
export interface BillDetailCreationAttributes
  extends Optional<BillDetailAttributes, "id"> { }

// Definición del modelo con tipado
export class BillDetailModel
  extends Model<BillDetailAttributes, BillDetailCreationAttributes>
  implements BillDetailAttributes {
  declare id: number;
  declare bill_id: number;
  declare product_id: number;
  declare quantity: number;
  declare unit_price: number;
  declare subtotal: number;
}

// Inicialización del modelo
BillDetailModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    bill_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "bills",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    unit_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.0,
      set(value) {
        // Forzamos que siempre se guarde como número
        this.setDataValue("unit_price", parseFloat(String(value)));
      },
    },
    subtotal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.0,
      set(value) {
        // Forzamos que siempre se guarde como número
        this.setDataValue("subtotal", parseFloat(String(value)));
      },
    }
  },
  {
    sequelize: connection,
    tableName: "bill_details",
    timestamps: false,
    modelName: "BillDetail",
  },
);