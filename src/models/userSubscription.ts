import {
  Association,
  CreationOptional,
  DataTypes,
  Model,
  NonAttribute,
} from 'sequelize';
import Database from '../common/database';
import User from './user';

class UserSubscription extends Model {
  declare userId: number;
  declare applied: boolean;
  declare reviewed: boolean;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare user?: NonAttribute<User>;

  declare static associations: {
    user: Association<UserSubscription, User>;
  };
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
