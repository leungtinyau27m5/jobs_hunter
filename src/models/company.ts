import { DataTypes, Model } from 'sequelize';
import Database from '../common/database';

class Company extends Model {
  declare bizRegNumber: number;
  declare name: string;
  declare description: string;
  declare district: string;

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
    bizRegNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    district: {
      type: DataTypes.STRING(25),
      allowNull: false,
      unique: false,
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
