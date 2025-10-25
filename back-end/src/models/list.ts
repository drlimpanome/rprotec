// models/list.ts

import { Model, DataTypes, Optional } from "sequelize";
import { sequelize } from "../database";
import NamesList from "./name_list";
import Client from "./client";
import ListGroup from "./list_group";
import StatusHistory from "./status_history";

interface ListAttributes {
  id?: number;
  list_name: string;
  creation_date?: Date;
  status: string;
  protocol: string;
  client_id?: number;
  affiliateId?: number;
  list_group_id?: number;
  list_payment_id?: string;
  comprovanteUrl?: string;
  group_payment_id: any;
  price: number;
  names_quantity: number;
  confirmed_affiliate_list?: number;
  payed?: boolean;
}

interface ListCreationAttributes
  extends Optional<ListAttributes, "id" | "creation_date"> {}

class List
  extends Model<ListAttributes, ListCreationAttributes>
  implements ListAttributes
{
  public id!: number;
  public confirmed_affiliate_list!: number;
  public list_name!: string;
  public creation_date!: Date;
  public price!: number;
  public status!: string;
  public protocol!: string;
  public client_id?: number;
  public affiliateId?: number;
  public list_group_id?: number;
  public list_payment_id?: string;
  public listGroup: any;
  public group_payment_id: any;
  public names_quantity!: number;
  public comprovanteUrl?: string;
  public payed?: boolean;

  static associate() {
    List.hasMany(NamesList, { foreignKey: "list_id", as: "listData" });
    List.belongsTo(Client, { foreignKey: "client_id", as: "client" });
    List.belongsTo(ListGroup, { foreignKey: "list_group_id", as: "listGroup" });
    List.hasMany(StatusHistory, { foreignKey: "list_id", as: "statusHistory" });
  }
}

List.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    list_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    creation_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    protocol: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    list_payment_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    client_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Client,
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    affiliateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    comprovanteUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    list_group_id: {
      type: DataTypes.INTEGER,
      references: {
        model: ListGroup,
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    group_payment_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    confirmed_affiliate_list: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0,
    },
    names_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    payed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "lists",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default List;
