import { pbkdf2Sync, randomBytes } from 'crypto';
import {
  Association,
  CreationOptional,
  DataTypes,
  Model,
  NonAttribute,
} from 'sequelize';
import Database from '../common/database';
import jwt from 'jsonwebtoken';
import config from '../config';
import logger from '../common/logger';
import UserSubscription from './userSubscription';
import JobApplication from './jobApplication';

class User extends Model {
  declare id: CreationOptional<number>;
  declare username: string;
  declare email: string;
  declare salt: string;
  declare hash: string;
  declare cvStatus: 'public' | 'companyOnly' | 'hide';
  declare icon: string | null;
  declare cv: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare appliedJobs?: NonAttribute<JobApplication[]>;
  declare subscription?: NonAttribute<UserSubscription>;

  declare static associations: {
    appliedJobs: Association<User, JobApplication>;
    subscription: Association<User, UserSubscription>;
  };

  generateJWT(): string {
    return jwt.sign(
      {
        id: this.id,
        username: this.username,
        email: this.email,
      },
      config.secret,
      {
        expiresIn: '30days',
        algorithm: 'HS256',
      }
    );
  }

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

  toAuthJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      token: this.generateJWT(),
    };
  }
}

User.init(
  {
    username: {
      type: DataTypes.STRING(25),
      validate: {
        len: [2, 25],
        is: {
          msg: 'only english and number is allowed',
          args: /^[a-zA-Z0-9]+$/,
        },
      },
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
    icon: {
      type: DataTypes.STRING(512),
      allowNull: true,
    },
    cv: {
      type: DataTypes.STRING(2083),
      allowNull: true,
    },
    cvStatus: {
      type: DataTypes.ENUM('public', 'companyOnly', 'hide'),
      defaultValue: 'hide',
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
    tableName: 'users',
    freezeTableName: true,
    updatedAt: true,
    createdAt: true,
  }
);

User.afterCreate(async (user) => {
  try {
    const userId = user.id;
    UserSubscription.create({
      userId,
    });
  } catch (err) {
    logger.debug(err);
  }
});

export default User;
