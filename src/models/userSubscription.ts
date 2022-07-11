import { DataTypes, Model } from 'sequelize';
import Database from '../common/database';

class UserSubscription extends Model {
  declare userId: number;
  declare applied: boolean;
  declare reviewed: boolean;
}

UserSubscription.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    applied: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    reviewed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize: Database,
    freezeTableName: true,
    tableName: 'user_subscription',
  }
);

export default UserSubscription;
