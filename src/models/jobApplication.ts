import { DataTypes, Model } from 'sequelize';
import Database from '../common/database';
import logger from '../common/logger';
import transporter from '../mailer';
import User from './user';
import UserSubscription from './userSubscription';

class JobApplication extends Model {
  declare userId: number;
  declare jobId: number;
  declare bizReg: string;
  declare status: 'sent' | 'reviewed';
}

JobApplication.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    jobId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('sent', 'reviewed'),
      allowNull: false,
      defaultValue: 'sent',
    },
  },
  {
    sequelize: Database,
    tableName: 'job_applications',
    freezeTableName: true,
    createdAt: true,
    updatedAt: true,
  }
);

JobApplication.afterUpdate(async (application) => {
  try {
    const userSub = await UserSubscription.findOne({
      where: {
        userId: application.userId,
      },
      include: {
        model: User,
        attributes: ['email'],
      },
    });
    if (!userSub) {
      logger.debug(
        `job application mailer: ${application.userId}'s subscription config not found`
      );
      return;
    }
    // TODO
  } catch (err) {
    logger.debug(err);
  }
});

export default JobApplication;
