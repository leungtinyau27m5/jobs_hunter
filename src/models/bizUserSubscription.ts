import {
  Association,
  CreationOptional,
  DataTypes,
  ForeignKey,
  Model,
  NonAttribute,
} from 'sequelize';
import Database from '../common/database';
import BizUser from './bizUser';

class BizUserSubscription extends Model {
  declare bizUserId: ForeignKey<BizUser['id']>;
  declare applied: boolean;
  declare updatedAt: CreationOptional<Date>;

  declare bizUser?: NonAttribute<BizUser>;

  declare static associations: {
    bizUser: Association<BizUserSubscription, BizUser>;
  };
}

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
    updatedAt: true,
    createdAt: false,
  }
);

export default BizUserSubscription;
