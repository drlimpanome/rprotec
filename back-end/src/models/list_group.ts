// models/list_group.ts

import { Model, DataTypes, Optional } from "sequelize";
import { sequelize } from "../database";
import List from "./list";
import StatusHistory from "./status_history";

interface ListGroupAttributes {
  id?: number;
  expires_at?: Date;
  name: string;
  status: ListStatus;
  admin: boolean;
}

interface ListGroupCreationAttributes
  extends Optional<ListGroupAttributes, "id" | "status"> {}

type ListStatus =
  | "pagamento aprovado"
  | "finalizada"
  | "aguardando protocolar"
  | "decisão judicial"
  | "spc"
  | "boa vista"
  | "cenprot sp"
  | "cenprot br"
  | "quod"
  | "serasa";

class ListGroup
  extends Model<ListGroupAttributes, ListGroupCreationAttributes>
  implements ListGroupAttributes
{
  public id!: number;
  public name!: string;
  public expires_at?: Date;
  public status!: ListStatus;
  public admin!: boolean;

  static associate() {
    ListGroup.hasMany(List, { foreignKey: "list_group_id", as: "lists" });
    ListGroup.hasMany(StatusHistory, {
      foreignKey: "list_group_id",
      as: "statusHistory",
    });
  }
}

ListGroup.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    admin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    status: {
      type: DataTypes.ENUM(
        "pagamento aprovado",
        "finalizada",
        "aguardando protocolar",
        "decisão judicial",
        "spc",
        "boa vista",
        "cenprot sp",
        "cenprot br",
        "quod",
        "serasa"
      ),
      allowNull: false,
      defaultValue: "pagamento aprovado",
    },
  },
  {
    sequelize,
    tableName: "list_groups",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default ListGroup;
