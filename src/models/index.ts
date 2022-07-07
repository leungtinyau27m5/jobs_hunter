import BizUser from './bizUser';
import Company from './company';
import Job from './job';

const syncTable = () => {
  Job.belongsTo(Company, {
    foreignKey: 'bizRegNumber',
  });
  Job.belongsTo(BizUser, {
    foreignKey: 'lastUpdatedBy',
  });
  BizUser.hasMany(Job, {
    foreignKey: 'lastUpdatedBy'
  })
  Company.hasMany(Job, {
    foreignKey: 'bizRegNumber',
  });
  Company.hasMany(BizUser, {
    foreignKey: 'bizRegNumber',
  });
  BizUser.belongsTo(Company, {
    foreignKey: 'bizRegNumber',
  });
};

export default syncTable;
