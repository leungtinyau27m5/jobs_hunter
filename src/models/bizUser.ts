import { pbkdf2Sync, randomBytes } from 'crypto';
import {
  Association,
  CreationOptional,
  DataTypes,
  ForeignKey,
  Model,
  NonAttribute,
} from 'sequelize';
import Database from '../common/database';
import jwt from 'jsonwebtoken';
import config from '../config';
import logger from '../common/logger';
import BizUserSubscription from './bizUserSubscription';
import Company from './company';
import Job from './job';

class BizUser extends Model {
  declare id: CreationOptional<number>;
  declare bizReg: ForeignKey<Company['bizReg']>;
  declare username: string;
  declare role: string;
  declare email: string;
  declare salt: string;
  declare hash: string;
  declare lastPasswordUpdated: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare createdJobs?: NonAttribute<Job[]>;
  declare company: NonAttribute<Company>;
  declare subscription?: NonAttribute<BizUserSubscription>;

  declare static associations: {
    createdJobs: Association<BizUser, Job>;
    company: Association<BizUser, Company>;
    subscription: Association<BizUser, BizUserSubscription>;
  };

  setPassword(password: string) {
    this.salt = randomBytes(16).toString('hex');
    this.hash = pbkdf2Sync(password, this.salt, 1000, 512, 'sha512').toString(
      'hex'
    );
  }

  validatePassword(password: string) {
    const hash = pbkdf2Sync(password, this.salt, 1000, 512, 'sha512').toString(
      'hex'
    );
    return this.hash === hash;
  }

  generateJWT(): string {
    return jwt.sign(
      {
        id: this.id,
        username: this.username,
        email: this.email,
        role: this.role,
        bizReg: this.bizReg,
        issueAt: Date.now(),
      },
      config.secret,
      {
        expiresIn: '30days',
        algorithm: 'HS256',
      }
    );
  }

  toAuthJSON() {
    return {
      id: this.id,
      bizReg: this.bizReg,
      username: this.username,
      role: this.role,
      email: this.email,
      token: this.generateJWT(),
    };
  }
}

BizUser.init(
  {
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: 'email',
      validate: {
        isEmail: {
          msg: 'invalid email',
        },
      },
    },
    lastPasswordUpdated: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    salt: {
      type: DataTypes.STRING(32),
      allowNull: false,
    },
    hash: {
      type: DataTypes.STRING(1024),
      allowNull: false,
    },
  },
  {
    sequelize: Database,
    tableName: 'biz_users',
    freezeTableName: true,
    timestamps: true,
  }
);

BizUser.afterCreate(async (bizUser) => {
  try {
    const bizUserId = bizUser.id;
    BizUserSubscription.create({
      bizUserId,
    });
  } catch (err) {
    logger.debug(err);
  }
});

export default BizUser;
