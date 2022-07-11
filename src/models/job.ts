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
import Company from './company';
import JobApplication from './jobApplication';
import JobCategory from './jobCat';

class Job extends Model {
  declare id: CreationOptional<number>;
  declare bizReg: ForeignKey<Company['bizReg']>;
  declare title: string;
  declare description: string;
  declare status: 'active' | 'closed' | 'expired';
  declare lastUpdatedBy: ForeignKey<BizUser['id']>;
  declare categoryId: ForeignKey<JobCategory['id']> | null;
  declare created: CreationOptional<Date>;
  declare updated: CreationOptional<Date>;

  declare company?: NonAttribute<Company>;
  declare updatedBy?: NonAttribute<BizUser>;
  declare category?: NonAttribute<JobCategory>;
  declare applications?: NonAttribute<JobApplication[]>;

  declare static associations: {
    company: Association<Job, Company>;
    updatedBy: Association<Job, BizUser>;
    category: Association<Job, JobCategory>;
    applications: Association<Job, JobApplication>;
  };
}

Job.init(
  {
    title: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'closed', 'expired'),
      defaultValue: 'active',
    },
  },
  {
    sequelize: Database,
    tableName: 'jobs',
    freezeTableName: true,
    timestamps: true,
  }
);

export default Job;
