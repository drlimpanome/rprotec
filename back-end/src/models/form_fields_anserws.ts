import { Model, DataTypes } from "sequelize";
import { sequelize } from "../database";
import Service from "./service";
import FormField from "./form_fields";
import Client from "./client";
import ServiceFormSubmission from "./submission_group";

class ServiceFormFieldAnswer extends Model {
  public id!: number;
  public service_id!: number;
  public form_field_id!: number;
  public user_id!: number;
  public service_form_submission_id!: number;
  public answer!: string;
  public invalid_reason?: string;
  public submission_group!: string; // Identificador único para cada submissão
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  static associate() {
    ServiceFormFieldAnswer.belongsTo(Service, {
      foreignKey: "service_id",
      as: "service",
    });
    ServiceFormFieldAnswer.belongsTo(FormField, {
      foreignKey: "form_field_id",
      as: "formField",
    });
    ServiceFormFieldAnswer.belongsTo(Client, {
      foreignKey: "user_id",
      as: "user",
    });
    ServiceFormFieldAnswer.belongsTo(ServiceFormSubmission, {
      foreignKey: "service_form_submission_id",
      as: "serviceFormSubmission",
    });
  }
}

ServiceFormFieldAnswer.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "services",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    form_field_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "form_fields",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
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
    service_form_submission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "service_form_submissions",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    invalid_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    submission_group: {
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
  },
  {
    sequelize,
    tableName: "service_form_fields_answers",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default ServiceFormFieldAnswer;
