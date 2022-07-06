import Company from "./company";
import Job from "./job";

const syncTable = () => {
  Job.belongsTo(Company, {
    foreignKey: "companyId",
  });
  Company.hasMany(Job, {
    foreignKey: "companyId",
  });
};

export default syncTable;
