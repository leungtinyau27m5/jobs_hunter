import { pbkdf2Sync, randomBytes } from 'crypto';
import { DataTypes, Model } from 'sequelize';
import Database from '../common/database';
import jwt from 'jsonwebtoken';
import config from '../config';

class BizUser extends Model {
  declare id: string;
  declare username: string;
  declare role: string;
  declare email: string;
  declare salt: string;
  declare hash: string;
  declare bizReg: number;

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
        bizReg: this.bizReg,
        username: this.username,
        role: this.role,
        email: this.email,
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
      unique: true,
      validate: {
        isEmail: {
          msg: 'invalid email',
        },
      },
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

export default BizUser;
