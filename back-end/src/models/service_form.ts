import { Model, DataTypes } from "sequelize";
import { sequelize } from "../database";
import Service from "./service";
import FormField from "./form_fields";
import ServiceFormSubmission from "./submission_group";

class ServiceForm extends Model {
  public id!: number;
  public service_id!: number;
  public name!: string;
  public active!: boolean;

  static associate() {
    ServiceForm.belongsTo(Service, {
      foreignKey: "service_id",
      as: "service",
    });
    ServiceForm.hasMany(FormField, {
      foreignKey: "serviceForm_id",
      as: "formFields",
    });
    ServiceForm.hasMany(ServiceFormSubmission, {
      foreignKey: "service_form_id",
      as: "serviceForm",
    });
  }
}

ServiceForm.init(
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "servicesForm",
    timestamps: false,
  }
);

export default ServiceForm;
