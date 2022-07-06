import { DataTypes, Model } from "sequelize";
import Database from "../common/database";

class Job extends Model {}

Job.init(
  {
    title: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize: Database,
    tableName: "jobs",
    freezeTableName: true,
    timestamps: true,
  }
);

export default Job;
