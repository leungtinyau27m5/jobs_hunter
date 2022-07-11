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
import CompanyCat from './companyCat';
import Job from './job';
import JobApplication from './jobApplication';

class Company extends Model {
  declare bizReg: CreationOptional<string>;
  declare categoryId: ForeignKey<CompanyCat['id']>;
  declare name: string;
  declare description: string;
  declare district: string;
  declare url: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare category?: NonAttribute<CompanyCat>;
  declare jobs?: NonAttribute<Job[]>;
  declare bizUsers?: NonAttribute<BizUser[]>;
  declare applications?: NonAttribute<JobApplication[]>;

  declare static associations: {
    category: Association<Company, CompanyCat>;
    jobs: Association<Company, Job>;
    bizUsers: Association<Company, BizUser>;
    applications: Association<Company, JobApplication>;
  };

  toPublic() {
    return {
      name: this.name,
      description: this.description,
      district: this.district,
    };
  }
}

Company.init(
  {
    bizReg: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      unique: 'bizReg',
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: 'name',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    district: {
      type: DataTypes.STRING(25),
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING(512),
      allowNull: true,
    },
  },
  {
    sequelize: Database,
    tableName: 'companies',
    freezeTableName: true,
    timestamps: true,
  }
);

export default Company;
