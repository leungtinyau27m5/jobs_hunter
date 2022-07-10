import BizUser from "./bizUser";
import Company from "./company";
import Job from "./job";
import JobCategory from "./jobCat";

const syncTable = () => {
  Job.belongsTo(Company, {
    foreignKey: "bizReg",
  });
  Job.belongsTo(BizUser, {
    foreignKey: "lastUpdatedBy",
  });
  Job.belongsTo(JobCategory, {
    foreignKey: "categoryId",
  });
  JobCategory.hasMany(Job, {
    foreignKey: "catgoryId",
  });
  BizUser.hasMany(Job, {
    foreignKey: "lastUpdatedBy",
  });
  Company.hasMany(Job, {
    foreignKey: "bizReg",
  });
  Company.hasMany(BizUser, {
    foreignKey: "bizReg",
  });
  BizUser.belongsTo(Company, {
    foreignKey: "bizReg",
  });
};

export default syncTable;
