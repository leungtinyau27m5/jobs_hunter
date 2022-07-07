import { DataTypes, Model } from 'sequelize';
import Database from '../common/database';

class Job extends Model {
  declare id: number;
  declare title: string;
  declare description: string;
  declare status: 'active' | 'closed' | 'expired';
}

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
    status: {
      type: DataTypes.ENUM('active', 'closed', 'expired'),
      defaultValue: 'active',
    },
  },
  {
    sequelize: Database,
    tableName: 'jobs',
    freezeTableName: true,
    timestamps: true,
  }
);

export default Job;
