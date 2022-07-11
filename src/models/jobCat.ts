import {
  Association,
  CreationOptional,
  DataTypes,
  Model,
  NonAttribute,
} from 'sequelize';
import Database from '../common/database';
import Job from './job';

class JobCategory extends Model {
  declare id: CreationOptional<number>;
  declare name: string;
  declare description: string | null;
  declare created: CreationOptional<Date>;
  declare updated: CreationOptional<Date>;

  declare jobs?: NonAttribute<Job[]>;

  declare static associations: {
    jobs: Association<JobCategory, Job>;
  };
}

JobCategory.init(
  {
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: 'name',
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize: Database,
    tableName: 'job_categories',
    freezeTableName: true,
    timestamps: true,
  }
);

export default JobCategory;
