import { DataTypes, Model, type Optional } from "sequelize";
import { getSequelizeConfig } from "@config/sequelize.config.js";

const connection = getSequelizeConfig();

// Interfaces para el modelo Product
export interface ProductAttributes {
  id: number;
  code: string;
  name: string;
  unit_price: number;
  is_active: boolean;
  created_at: Date
}

// Tipo para criterios de búsqueda simple
export type ProductSearchData = {
  id?: number;
  name?: string;
  is_active?: boolean;
};

// Opcionalidad para la creación (id es auto-generado)
export interface ProductCreationAttributes
  extends Optional<ProductAttributes, "id"> { }

// Definición del modelo con tipado
export class ProductModel
  extends Model<ProductAttributes, ProductCreationAttributes>
  implements ProductAttributes {
  declare id: number;
  declare code: string;
  declare name: string;
  declare unit_price: number;
  declare is_active: boolean;
  declare created_at: Date
}

// Inicialización del modelo
ProductModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
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
    is_active: {
        type: DataTypes.BOOLEAN(),
        allowNull: false,
        defaultValue: true
    },
    created_at: {
        type: DataTypes.DATE(),
        defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize: connection,
    tableName: "Products",
    timestamps: false,
    modelName: "Product",
  },
);