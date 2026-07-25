import { DataTypes, Model, type Optional } from "sequelize";
import { getSequelizeConfig } from "@config/sequelize.config.js";

const connection = getSequelizeConfig();

// Interfaces para el modelo PrintConfig
export interface PrintConfigAttributes {
  id: number;
  nombre_negocio: string;
  direccion: string | null;
  telefono: string | null;
  cif: string | null;
  pie_pagina: string | null;
  ancho_papel: number;
  font_size: number;
  factura_imprime_servidor: boolean;
  factura_auto_print: boolean;
  impresora_facturas: string | null;
  logo_data: Buffer | null;
  logo_tipo: string | null;
  qr_data: Buffer | null;
  qr_tipo: string | null;
}

// Opcionalidad para la creación (id es auto-generado)
export interface PrintConfigCreationAttributes
  extends Optional<PrintConfigAttributes, "id"> {}

// Definición del modelo con tipado estricto
export class PrintConfigModel
  extends Model<PrintConfigAttributes, PrintConfigCreationAttributes>
  implements PrintConfigAttributes
{
  declare id: number;
  declare nombre_negocio: string;
  declare direccion: string | null;
  declare telefono: string | null;
  declare cif: string | null;
  declare pie_pagina: string | null;
  declare ancho_papel: number;
  declare font_size: number;
  declare factura_imprime_servidor: boolean;
  declare factura_auto_print: boolean;
  declare impresora_facturas: string | null;
  declare logo_data: Buffer | null;
  declare logo_tipo: string | null;
  declare qr_data: Buffer | null;
  declare qr_tipo: string | null;
}

// Inicialización del modelo
PrintConfigModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre_negocio: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cif: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pie_pagina: {
      type: DataTypes.TEXT, // Usamos TEXT por si el pie de página es muy largo
      allowNull: true,
    },
    ancho_papel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 80,
    },
    font_size: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    factura_imprime_servidor: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    factura_auto_print: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    impresora_facturas: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    logo_data: {
      type: DataTypes.BLOB("long"), // BLOB para almacenar los datos binarios de la imagen
      allowNull: true,
    },
    logo_tipo: {
      type: DataTypes.STRING, // Ej: "image/png"
      allowNull: true,
    },
    qr_data: {
      type: DataTypes.BLOB("long"),
      allowNull: true,
    },
    qr_tipo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize: connection,
    tableName: "print_config",
    timestamps: false,
    modelName: "PrintConfig",
  }
);