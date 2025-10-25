// models/StatusHistory.ts
import { Model, DataTypes } from "sequelize";
import ListGroup from "./list_group";
import List from "./list";
import ServiceFormSubmission from "./submission_group";
import { sequelize } from "../database";

class StatusHistory extends Model {
  public id!: number;
  public list_group_id!: number;
  public list_id!: number | null;
  public submission_id!: number | null;
  public status!: string;
  public updated_at!: Date;

  static associate() {
    StatusHistory.belongsTo(ListGroup, {
      foreignKey: "list_group_id",
      as: "listGroup",
    });
    StatusHistory.belongsTo(List, { foreignKey: "list_id", as: "list" });
    StatusHistory.belongsTo(ServiceFormSubmission, {
      foreignKey: "submission_id",
      as: "submission",
    });
  }
}

StatusHistory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    list_group_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: ListGroup,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    list_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: List,
        key: "id",
      },
      onDelete: "SET NULL",
    },
    submission_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: ServiceFormSubmission,
        key: "id",
      },
      onDelete: "SET NULL",
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "status_history",
    timestamps: false,
  }
);

export default StatusHistory;
