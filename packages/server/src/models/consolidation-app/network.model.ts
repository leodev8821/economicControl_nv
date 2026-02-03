import { DataTypes, Model as SequelizeModel, type Optional } from "sequelize";
import { getSequelizeConfig } from "../../config/sequelize.config.js";

const connection = getSequelizeConfig();

export interface NetworkAttributes {
  id: number;
  name: string;
  is_visible: boolean;
}

export type NetworkSearchData = {
  id?: number;
  name?: string;
  is_visible?: boolean;
};

export interface NetworkCreationAttributes extends Optional<
  NetworkAttributes,
  "id" | "is_visible"
> {}

export class NetworkModel
  extends SequelizeModel<NetworkAttributes, NetworkCreationAttributes>
  implements NetworkAttributes
{
  declare id: number;
  declare name: string;
  declare is_visible: boolean;
}

NetworkModel.init(
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
    tableName: "networks",
    timestamps: false,
    modelName: "Network",
    scopes: {
      visible: {
        where: { is_visible: true },
      },
    },
  },
);

export class NetworkActions {
  public static async getAll(): Promise<NetworkAttributes[]> {
    const networks = await NetworkModel.scope("visible").findAll();
    return networks.map((network) => network.get({ plain: true }));
  }

  public static async getOne(
    data: NetworkSearchData,
  ): Promise<NetworkAttributes | null> {
    const network = await NetworkModel.scope("visible").findOne({
      where: data,
    });
    return network ? network.get({ plain: true }) : null;
  }

  public static async create(
    data: NetworkCreationAttributes,
  ): Promise<NetworkAttributes> {
    const newNetwork = await NetworkModel.create(data);
    return newNetwork.get({ plain: true });
  }

  // Refactorizado a Soft Delete
  public static async delete(id: number): Promise<boolean> {
    const [count] = await NetworkModel.update(
      { is_visible: false },
      { where: { id } },
    );
    return count > 0;
  }

  public static async update(
    id: number,
    data: Partial<NetworkCreationAttributes>,
  ): Promise<NetworkAttributes | null> {
    const [count] = await NetworkModel.update(data, { where: { id } });
    if (!count) return null;

    const updatedNetwork = await NetworkModel.findByPk(id);
    return updatedNetwork ? updatedNetwork.get({ plain: true }) : null;
  }
}
