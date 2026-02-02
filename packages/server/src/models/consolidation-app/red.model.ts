import { DataTypes, Model as SequelizeModel, type Optional } from "sequelize";
import { getSequelizeConfig } from "../../config/sequelize.config.js";

const connection = getSequelizeConfig();

export interface RedAttributes {
  id: number;
  name: string;
  is_visible: boolean;
}

export type RedSearchData = {
  id?: number;
  name?: string;
  is_visible?: boolean;
};

export interface RedCreationAttributes extends Optional<
  RedAttributes,
  "id" | "is_visible"
> {}

export class RedModel
  extends SequelizeModel<RedAttributes, RedCreationAttributes>
  implements RedAttributes
{
  declare id: number;
  declare name: string;
  declare is_visible: boolean;
}

RedModel.init(
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
    is_visible: {
      // Agregado
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize: connection,
    tableName: "redes",
    timestamps: false,
    modelName: "Red",
    scopes: {
      visible: {
        where: { is_visible: true },
      },
    },
  },
);

export class RedActions {
  public static async getAll(): Promise<RedAttributes[]> {
    const redes = await RedModel.scope("visible").findAll();
    return redes.map((red) => red.get({ plain: true }));
  }

  public static async getOne(
    data: RedSearchData,
  ): Promise<RedAttributes | null> {
    const red = await RedModel.scope("visible").findOne({
      where: data,
    });
    return red ? red.get({ plain: true }) : null;
  }

  public static async create(
    data: RedCreationAttributes,
  ): Promise<RedAttributes> {
    const newRed = await RedModel.create(data);
    return newRed.get({ plain: true });
  }

  // Refactorizado a Soft Delete
  public static async delete(id: number): Promise<boolean> {
    const [count] = await RedModel.update(
      { is_visible: false },
      { where: { id } },
    );
    return count > 0;
  }

  public static async update(
    id: number,
    data: Partial<RedCreationAttributes>,
  ): Promise<RedAttributes | null> {
    const [count] = await RedModel.update(data, { where: { id } });
    if (!count) return null;

    const updatedRed = await RedModel.findByPk(id);
    return updatedRed ? updatedRed.get({ plain: true }) : null;
  }
}
