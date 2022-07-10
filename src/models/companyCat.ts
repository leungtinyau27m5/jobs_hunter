import { DataTypes, Model } from "sequelize";
import Database from "../common/database";

class CompanyCat extends Model {}

CompanyCat.init(
  {
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: "name",
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize: Database,
    tableName: "company_categories",
    freezeTableName: true,
    timestamps: true,
  }
);

export default CompanyCat;
