import { Model, DataTypes, Optional, Sequelize } from "sequelize";
import { sequelize } from "../database";
import List from "./list"; // Assuming the List model is in the same directory

interface NamesListAttributes {
  id?: number;
  nome: string;
  cpf: string;
  list_id?: number;
}

interface NamesListCreationAttributes
  extends Optional<NamesListAttributes, "id"> {}

class NamesList
  extends Model<NamesListAttributes, NamesListCreationAttributes>
  implements NamesListAttributes
{
  public id!: number;
  public nome!: string;
  public cpf!: string;
  public list_id?: number;
  static associate() {
    NamesList.belongsTo(List, { foreignKey: "list_id", as: "list" });
  }
}

NamesList.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cpf: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    list_id: {
      type: DataTypes.INTEGER,
      references: {
        model: List,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    sequelize,
    tableName: "names_list",
    timestamps: false,
  }
);

export default NamesList;
