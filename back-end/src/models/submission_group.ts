import { Model, DataTypes } from "sequelize";
import { sequelize } from "../database";
import ServiceForm from "./service_form";
import Client from "./client";
import ServiceFormFieldAnswer from "./form_fields_anserws";
import StatusHistory from "./status_history";

class ServiceFormSubmission extends Model {
  public id!: number;
  public user_id!: number;
  public service_form_id!: number;
  public price!: number;
  public status!: string;
  public confirmed_affiliate_list!: number;
  public comprovanteUrl?: string;
  public affiliate_id?: number;
  public service_payment_id?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  static associate() {
    ServiceFormSubmission.belongsTo(ServiceForm, {
      foreignKey: "service_form_id",
      as: "serviceForm",
    });
    ServiceFormSubmission.belongsTo(Client, {
      foreignKey: "user_id",
      as: "user",
    });
    ServiceFormSubmission.hasMany(StatusHistory, {
      foreignKey: "submission_id",
      as: "statusHistory",
    });
    ServiceFormSubmission.hasMany(ServiceFormFieldAnswer, {
      foreignKey: "service_form_submission_id",
      as: "answers",
    });
  }
}

ServiceFormSubmission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "clients",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    service_form_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "servicesForm",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    service_payment_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    protocol: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    comprovanteUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    affiliate_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
  },
  {
    sequelize,
    tableName: "service_form_submissions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default ServiceFormSubmission;
