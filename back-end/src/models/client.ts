import { Model, DataTypes, Optional } from "sequelize";
import { sequelize } from "../database";
import List from "./list";
import UserService from "./user_services";

interface ClientAttributes {
  id?: number;
  username: string;
  password: string;
  email: string;
  phone?: string;
  phone_fixed?: string;
  address?: string;
  cep?: string;
  role: number;
  price_consult?: number;
  created_at?: Date;
  active: boolean;
  uses_pix: boolean;
  document: string;
  updated_at?: Date;
  affiliateId?: number;
  api_key?: string; // Adicionado o campo api_key
  pix_key?: string;
  responsible?: string;
}

interface ClientCreationAttributes
  extends Optional<ClientAttributes, "id" | "api_key"> {} //api_key opcional na criação

class Client
  extends Model<ClientAttributes, ClientCreationAttributes>
  implements ClientAttributes
{
  month(month: any) {
    throw new Error("Method not implemented.");
  }
  public id!: number;
  public username!: string;
  public document!: string;
  public password!: string;
  public email!: string;
  public phone?: string;
  public phone_fixed?: string;
  public address?: string;
  public cep?: string;
  public role!: number;
  public price_consult?: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public active!: boolean;
  public uses_pix!: boolean;
  public pix_key?: string;
  public responsible?: string;

  public affiliateId?: number;
  public affiliate?: Client;
  public affiliates?: Client[];
  public api_key?: string; // Adicionado o campo api_key

  static associate() {
    Client.hasMany(List, { foreignKey: "client_id", as: "lists" });
    Client.hasMany(UserService, { foreignKey: "client_id", as: "services" });
    Client.belongsTo(Client, { as: "affiliate", foreignKey: "affiliateId" });
    Client.hasMany(Client, { as: "affiliates", foreignKey: "affiliateId" });
  }
}

Client.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    document: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    responsible: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone_fixed: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cep: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    uses_pix: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
    price_consult: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0.0,
    },
    affiliateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "clients",
        key: "id",
      },
    },
    api_key: {
      // Definição do campo api_key
      type: DataTypes.STRING(255), // Ou DataTypes.TEXT se necessário
      allowNull: true, // Ou false se for obrigatório
      unique: true, // Muito importante para API Keys
    },
    pix_key: {
      // Definição do campo api_key
      type: DataTypes.STRING(255), // Ou DataTypes.TEXT se necessário
      allowNull: true, // Ou false se for obrigatório
    },
  },
  {
    sequelize,
    tableName: "clients",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Client;
