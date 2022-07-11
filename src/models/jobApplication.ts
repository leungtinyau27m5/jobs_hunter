import {
  Association,
  CreationOptional,
  DataTypes,
  Model,
  NonAttribute,
} from 'sequelize';
import Database from '../common/database';
import logger from '../common/logger';
import transporter from '../mailer';
import applicationReview from '../mailer/templates/applicationReview';
import jobApplied from '../mailer/templates/jobApplied';
import notifyBizJobApplied from '../mailer/templates/notifyBizJobApplied';
import BizUser from './bizUser';
import BizUserSubscription from './bizUserSubscription';
import Company from './company';
import Job from './job';
import User from './user';
import UserSubscription from './userSubscription';

class JobApplication extends Model {
  declare userId: number;
  declare jobId: number;
  declare bizReg: string;
  declare status: 'sent' | 'reviewed' | 'checked';
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare user?: NonAttribute<User>;
  declare job?: NonAttribute<Job>;
  declare company?: NonAttribute<Company>;

  declare static associations: {
    user: Association<JobApplication, User>;
    job: Association<JobApplication, Job>;
    company: Association<JobApplication, Company>;
  };
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
      type: DataTypes.ENUM('sent', 'reviewed', 'checked'),
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
        as: 'user',
      },
    });
    if (!userSub) {
      logger.debug(
        `job application mailer: ${application.userId}'s subscription config not found`
      );
      return;
    }
    if (!userSub.user) {
      logger.debug(
        `job application mailer: ${application.userId}'s user config not found`
      );
      return;
    }
    const job = await Job.findOne({
      where: {
        id: application.jobId,
      },
    });
    if (!job) {
      logger.debug(
        `job application mailer: ${application.jobId} job not found`
      );
      return;
    }
    if (application.status === 'sent') {
      transporter.sendMail({
        to: userSub.user.email,
        subject: `${job.title} application is sent`,
        html: jobApplied,
      });
    } else if (application.status === 'reviewed') {
      transporter.sendMail({
        to: userSub.user.email,
        subject: `${job.title} application is under review`,
        html: applicationReview,
      });
    }
    const bizUsers = await BizUser.findAll({
      where: {
        bizReg: job.bizReg,
      },
      include: {
        model: UserSubscription,
        attributes: ['applied'],
        as: 'subscription',
      },
    });
    const emails = bizUsers.reduce((emails, user) => {
      if (!user.subscription) return emails;
      if (user.subscription.applied) emails.push(user.email);
      return emails;
    }, [] as string[]);
    Promise.all(
      emails.map((email) =>
        transporter.sendMail({
          to: email,
          subject: `${job.title} is applied by ${userSub.user?.username}`,
          html: notifyBizJobApplied,
        })
      )
    ).catch(logger.debug);
  } catch (err) {
    logger.debug(err);
  }
});

export default JobApplication;
