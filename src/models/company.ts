import { DataTypes, Model } from "sequelize";
import Database from "../common/database";

class Company extends Model {}

Company.init(
  {
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    district: {
      type: DataTypes.STRING(25),
      allowNull: false,
      unique: false,
    },
  },
  {
    sequelize: Database,
    tableName: "companies",
    freezeTableName: true,
    timestamps: true,
  }
);

export default Company;
