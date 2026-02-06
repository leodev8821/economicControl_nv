import { DataTypes, Model, type Optional } from "sequelize";
import { getSequelizeConfig } from "../../config/sequelize.config.js";
import {
  APPLICATION_VALUES,
  APPLICATION_DESCRIPTIONS_VALUES,
} from "@economic-control/shared";

const connection = getSequelizeConfig();

export type ApplicationType =
  (typeof APPLICATION_VALUES)[keyof typeof APPLICATION_VALUES];
export type ApplicationDescriptionType =
  (typeof APPLICATION_DESCRIPTIONS_VALUES)[keyof typeof APPLICATION_DESCRIPTIONS_VALUES];

export interface ApplicationAttributes {
  id: number;
  app_name: ApplicationType;
  description: ApplicationDescriptionType | null;
}

export type ApplicationSearchData = {
  id?: number;
  app_name?: string | ApplicationType;
};

export interface ApplicationCreationAttributes extends Optional<
  ApplicationAttributes,
  "id"
> {}

export class ApplicationModel
  extends Model<ApplicationAttributes, ApplicationCreationAttributes>
  implements ApplicationAttributes
{
  declare id: number;
  declare app_name: ApplicationType;
  declare description: ApplicationDescriptionType | null;
}

ApplicationModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    app_name: {
      type: DataTypes.ENUM(...APPLICATION_VALUES),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.ENUM(...APPLICATION_DESCRIPTIONS_VALUES),
      allowNull: true,
    },
  },
  {
    sequelize: connection,
    tableName: "applications",
    timestamps: false,
    modelName: "Application",
  },
);

export class ApplicationActions {
  public static async getAll(): Promise<ApplicationAttributes[]> {
    const apps = await ApplicationModel.findAll();
    return apps.map((app) => app.get({ plain: true }));
  }

  public static async getOne(
    data: Partial<ApplicationAttributes>,
  ): Promise<ApplicationAttributes | null> {
    const app = await ApplicationModel.findOne({ where: data });
    return app ? app.get({ plain: true }) : null;
  }

  public static async create(
    data: ApplicationCreationAttributes,
  ): Promise<ApplicationAttributes> {
    const newApp = await ApplicationModel.create(data);
    return newApp.get({ plain: true });
  }

  public static async delete(id: number): Promise<boolean> {
    const count = await ApplicationModel.destroy({ where: { id } });
    return count > 0;
  }
}
