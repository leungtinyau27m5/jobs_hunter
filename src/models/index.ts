import BizUser from './bizUser';
import BizUserSubscription from './bizUserSubscription';
import Company from './company';
import Job from './job';
import JobApplication from './jobApplication';
import JobCategory from './jobCat';
import User from './user';
import UserSubscription from './userSubscription';

const syncTable = () => {
  Job.belongsTo(Company, {
    foreignKey: 'bizReg',
  });
  Job.belongsTo(BizUser, {
    foreignKey: 'lastUpdatedBy',
  });
  Job.belongsTo(JobCategory, {
    foreignKey: 'categoryId',
  });
  Job.hasMany(JobApplication, {
    foreignKey: 'jobId',
  });
  JobCategory.hasMany(Job, {
    foreignKey: 'categoryId',
  });
  BizUser.hasMany(Job, {
    foreignKey: 'lastUpdatedBy',
  });
  Company.hasMany(Job, {
    foreignKey: 'bizReg',
  });
  Company.hasMany(BizUser, {
    foreignKey: 'bizReg',
  });
  Company.hasMany(JobApplication, {
    foreignKey: 'bizReg',
  });
  BizUser.belongsTo(Company, {
    foreignKey: 'bizReg',
  });
  BizUser.hasOne(BizUserSubscription, {
    foreignKey: 'bizUserId',
  });
  BizUserSubscription.belongsTo(BizUser, {
    foreignKey: 'bizUserId',
  });
  User.hasMany(JobApplication, {
    foreignKey: 'userId',
  });
  User.hasOne(UserSubscription, {
    foreignKey: 'userId',
  });
  UserSubscription.belongsTo(User, {
    foreignKey: 'userId',
  });
  JobApplication.belongsTo(User, {
    foreignKey: 'userId',
  });
  JobApplication.belongsTo(Job, {
    foreignKey: 'jobId',
  });
  JobApplication.belongsTo(Company, {
    foreignKey: 'bizReg',
  });
};

export default syncTable;
