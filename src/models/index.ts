import BizUser from './bizUser';
import BizUserSubscription from './bizUserSubscription';
import Company from './company';
import CompanyCat from './companyCat';
import Job from './job';
import JobApplication from './jobApplication';
import JobCategory from './jobCat';
import User from './user';
import UserSubscription from './userSubscription';

const syncTable = () => {
  Job.belongsTo(Company, {
    foreignKey: 'bizReg',
    as: 'company',
  });
  Job.belongsTo(BizUser, {
    foreignKey: 'lastUpdatedBy',
    as: 'updatedBy',
  });
  Job.belongsTo(JobCategory, {
    foreignKey: 'categoryId',
    as: 'category',
  });
  Job.hasMany(JobApplication, {
    foreignKey: 'jobId',
    as: 'applications',
  });
  JobCategory.hasMany(Job, {
    foreignKey: 'categoryId',
    as: 'jobs',
  });
  BizUser.hasMany(Job, {
    foreignKey: 'lastUpdatedBy',
    as: 'createdJobs',
  });
  BizUser.belongsTo(Company, {
    foreignKey: 'bizReg',
    as: 'company',
  });
  BizUser.hasOne(BizUserSubscription, {
    foreignKey: 'bizUserId',
    as: 'subscription',
  });
  BizUserSubscription.belongsTo(BizUser, {
    foreignKey: 'bizUserId',
    as: 'bizUser',
  });
  Company.hasMany(Job, {
    foreignKey: 'bizReg',
    as: 'jobs',
  });
  Company.hasMany(BizUser, {
    foreignKey: 'bizReg',
    as: 'bizUsers',
  });
  Company.hasMany(JobApplication, {
    foreignKey: 'bizReg',
    as: 'applications',
  });
  Company.belongsTo(CompanyCat, {
    foreignKey: 'categoryId',
    as: 'category',
  });
  CompanyCat.hasMany(Company, {
    foreignKey: 'categoryId',
    as: 'companies',
  });
  User.hasMany(JobApplication, {
    foreignKey: 'userId',
    as: 'appliedJobs',
  });
  User.hasOne(UserSubscription, {
    foreignKey: 'userId',
    as: 'subscription',
  });
  UserSubscription.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });
  JobApplication.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });
  JobApplication.belongsTo(Job, {
    foreignKey: 'jobId',
    as: 'job',
  });
  JobApplication.belongsTo(Company, {
    foreignKey: 'bizReg',
    as: 'company',
  });
};

export default syncTable;
