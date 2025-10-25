import { Model, DataTypes, Association } from "sequelize";
import { sequelize } from "../database";
import ServiceForm from "./service_form";

class Service extends Model {
  public id!: number;
  public name!: string;

  // Relacionamento
  public servicesForm?: ServiceForm[]; // Adiciona o relacionamento para TypeScript

  public static associations: {
    servicesForm: Association<Service, ServiceForm>;
  };

  static associate() {
    Service.hasMany(ServiceForm, {
      foreignKey: "service_id",
      as: "servicesForm",
    });
  }
}

Service.init(
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
  },
  {
    sequelize,
    tableName: "services",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Service;
