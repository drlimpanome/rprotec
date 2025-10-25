// models/user_service.ts
import { Model, DataTypes } from "sequelize";
import { sequelize } from "../database";
import Client from "./client";
import Service from "./service";

class UserService extends Model {
  public id!: number;
  public client_id!: number;
  public service_id!: number;
  public cost!: number;

  static associate() {
    UserService.belongsTo(Client, {
      foreignKey: "client_id",
      as: "client",
    });
    UserService.belongsTo(Service, {
      foreignKey: "service_id",
      as: "service",
    });
  }
}

UserService.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Client,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Service,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    cost: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "user_services",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default UserService;
