import { Model, DataTypes } from "sequelize";
import { sequelize } from "../database";
import ServiceForm from "./service_form";

class FormField extends Model {
  public id!: number;
  public serviceForm_id!: number;
  public label!: string;
  public type!: string;
  public required!: boolean;

  static associate() {
    FormField.belongsTo(ServiceForm, {
      foreignKey: "serviceForm_id",
      as: "serviceForm",
    });
  }
}

FormField.init(
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
    serviceForm_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "servicesForm",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    required: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "form_fields",
    timestamps: false,
  }
);

export default FormField;
