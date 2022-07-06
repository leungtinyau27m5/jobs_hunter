import { pbkdf2Sync, randomBytes } from "crypto";
import { DataTypes, Model } from "sequelize";
import Database from "../common/database";
import jwt from "jsonwebtoken";
import config from "../config";

class User extends Model {
  declare id: string;
  declare username: string;
  declare email: string;
  declare salt: string;
  declare hash: string;

  generateJWT(): string {
    const exp = new Date().getDate() + 30;
    return jwt.sign(
      {
        id: this.id,
        username: this.username,
        email: this.email,
        exp: new Date(exp).getTime() / 1000,
      },
      config.secret
    );
  }

  setPassword(password: string) {
    this.salt = randomBytes(16).toString("hex");
    this.hash = pbkdf2Sync(password, this.salt, 1000, 512, "sha512").toString(
      "hex"
    );
  }

  validatePassword(password: string) {
    const hash = pbkdf2Sync(password, this.salt, 1000, 512, "sha512").toString(
      "hex"
    );
    return this.hash === hash;
  }

  toJSON() {
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
          msg: "only english and number is allowed",
          args: /^[a-zA-Z0-9]+$/,
        },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: "invalid email",
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
    tableName: "users",
    freezeTableName: true,
    updatedAt: true,
    createdAt: true,
  }
);

export default User;
