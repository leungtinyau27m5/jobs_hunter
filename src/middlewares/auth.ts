import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { VerifyErrors } from 'jsonwebtoken';
import config from '../config';
import User from '../models/user';
import BizUser from '../models/bizUser';

/**
 * @apiDefine AuthUser User access only
 * Only Registered Users are allowed to access the endpoint
 * 
 * @apiDefine AuthBizUser Biz access only
 * Only Registered business users are allowed
 */

const getNormalUserTokenFromRequest = async (req: Request) => {
  return new Promise<VerifyErrors | null | boolean>((resolve) => {
    const token = req.cookies.token || req.headers.authorization;
    if (token) {
      req.token = token;
      jwt.verify(
        token,
        config.secret,
        {
          algorithms: ['HS256'],
        },
        (error, decoded) => {
          if (error) {
            resolve(error);
          } else if (decoded && typeof decoded !== 'string') {
            console.log(decoded);
            const { id, username, email, bizReg, role, issueAt } = decoded;
            req.user = { id, username, email, bizReg, role, issueAt };
            resolve(true);
          } else {
            resolve(false);
          }
        }
      );
    }
    resolve(null);
  });
};

export default {
  sameBiz: async (req: Request, res: Response, next: NextFunction) => {
    if (req.params.bizReg && req.params.bizReg === req.body.user.bizReg) next();
    else
      return res.status(401).json({
        errors: [
          {
            auth: `unauthorized access to ${req.params.bizReg} (biz)`,
          },
        ],
      });
  },
  bizUser: async (req: Request, res: Response, next: NextFunction) => {
    if (req.body.user && req.body.user.bizReg) next();
    else {
      return res.status(401).json({
        errors: [
          {
            auth: 'unauthroized access (biz)',
          },
        ],
      });
    }
  },
  required: async (req: Request, res: Response, next: NextFunction) => {
    const result = await getNormalUserTokenFromRequest(req);
    if (result instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ errors: [{ auth: result.message }] });
    } else if (result === false) {
      return res
        .status(401)
        .json({ errors: [{ auth: 'unauthorized access' }] });
    } else if (result === null) {
      return res
        .status(401)
        .json({ errors: [{ auth: 'token must be provided' }] });
    }
    if (req.user?.bizReg) {
      BizUser.findOne({
        where: {
          id: req.user.id,
          bizReg: req.user.bizReg,
        },
      })
        .then((bizUser) => {
          if (!bizUser) {
            return res.status(401).json({ errors: [{ bizUser: 'not found' }] });
          }
          if (!req.user?.issueAt) {
            res.cookie('token', '', {
              httpOnly: true,
              secure: config.isProd,
              maxAge: 1000,
            });
            return res
              .status(401)
              .json({ errors: [{ user: 'new auth required' }] });
          }
          if (
            bizUser.lastPasswordUpdated &&
            new Date(bizUser.lastPasswordUpdated).getTime() > req.user.issueAt
          ) {
            res.cookie('token', '', {
              httpOnly: true,
              secure: config.isProd,
              maxAge: 1000,
            });
            return res
              .status(401)
              .json({ errors: [{ user: 'new auth required' }] });
          }
          req.body.user = bizUser;
          next();
        })
        .catch(next);
    } else {
      User.findOne({
        where: {
          email: req.user?.email,
        },
      })
        .then((user) => {
          if (!user)
            return res.status(401).json({ errors: [{ user: 'not found' }] });
          if (!req.user?.issueAt) {
            res.cookie('token', '', {
              httpOnly: true,
              secure: config.isProd,
              maxAge: 1000,
            });
            return res
              .status(401)
              .json({ errors: [{ user: 'new auth required' }] });
          }
          if (
            user.lastPasswordUpdated &&
            new Date(user.lastPasswordUpdated).getTime() > req.user.issueAt
          ) {
            res.cookie('token', '', {
              httpOnly: true,
              secure: config.isProd,
              maxAge: 1000,
            });
            return res
              .status(401)
              .json({ errors: [{ user: 'new auth required' }] });
          }
          req.body.user = user;
          next();
        })
        .catch(next);
    }
  },
  optional: async (req: Request, res: Response, next: NextFunction) => {
    const result = await getNormalUserTokenFromRequest(req);
    if (result instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ errors: [{ auth: result.message }] });
    } else if (!result) {
      return next();
    }
    if (req.user?.bizReg) {
      BizUser.findOne({
        where: {
          id: req.user.id,
          bizReg: req.user.bizReg,
        },
      })
        .then((bizUser) => {
          req.body.user = bizUser;
          return next();
        })
        .catch(next);
    } else if (req.user) {
      User.findOne({
        where: {
          email: req.user.email,
        },
      })
        .then((user) => {
          req.body.user = user;
          return next();
        })
        .catch(next);
    } else {
      return next();
    }
  },
};
