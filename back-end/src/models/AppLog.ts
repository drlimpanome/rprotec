import { Model, DataTypes, Optional } from "sequelize";
import { sequelize } from "../database";

interface AppLogAttributes {
  id?: number;
  level?: string;
  message?: string;
  context?: string;
  service?: string;
  client_id?: string;
  list_id?: object | null; // JSON
  list_group_id?: object | null; // JSON
  data?: object | null; // JSON
  created_at?: Date;
  updated_at?: Date;
}

interface AppLogCreationAttributes extends Optional<AppLogAttributes, "id"> {}

class AppLog
  extends Model<AppLogAttributes, AppLogCreationAttributes>
  implements AppLogAttributes
{
  public id!: number;
  public level?: string;
  public message?: string;
  public context?: string;
  public service?: string;
  public client_id?: string;
  public list_id?: object | null;
  public list_group_id?: object | null;
  public data?: object | null;
  public created_at?: Date;
  public updated_at?: Date;

  // Sem associate porque não há FK
}

AppLog.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    level: {
      type: DataTypes.STRING(32),
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    context: {
      type: DataTypes.STRING(128),
      allowNull: true,
    },
    service: {
      type: DataTypes.STRING(128),
      allowNull: true,
    },
    client_id: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    list_id: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    list_group_id: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    data: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "app_logs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default AppLog;
