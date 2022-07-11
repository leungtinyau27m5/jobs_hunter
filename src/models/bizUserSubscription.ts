import { DataTypes, Model } from 'sequelize';
import Database from '../common/database';

class BizUserSubscription extends Model {}

BizUserSubscription.init(
  {
    bizUserId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    applied: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize: Database,
    tableName: 'biz_user_subscription',
    freezeTableName: true,
    createdAt: true,
  }
);

export default BizUserSubscription;
