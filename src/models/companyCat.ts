import {
  Association,
  CreationOptional,
  DataTypes,
  Model,
  NonAttribute,
} from 'sequelize';
import Database from '../common/database';
import Company from './company';

class CompanyCat extends Model {
  declare id: CreationOptional<number>;
  declare name: string;
  declare description: string | null;
  declare created: CreationOptional<Date>;
  declare updated: CreationOptional<Date>;

  declare companies?: NonAttribute<Company[]>;

  declare static associations: {
    companies: Association<CompanyCat, Company>;
  };
}

CompanyCat.init(
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
    tableName: 'company_categories',
    freezeTableName: true,
    createdAt: true,
    updatedAt: false,
  }
);

export default CompanyCat;
