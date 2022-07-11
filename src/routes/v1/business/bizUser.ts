import { Router } from 'express';
import { Op, WhereOptions } from 'sequelize';
import logger from '../../../common/logger';
import config from '../../../config';
import transporter from '../../../mailer';
import { bizUsercreatedMail } from '../../../mailer/templates/bizUser';
import { passwordChangedTemplate } from '../../../mailer/templates/users';
import auth from '../../../middlewares/auth';
import BizUser from '../../../models/bizUser';
import Job from '../../../models/job';

const bizUser = Router();

bizUser.post('/login', async (req, res, next) => {
  const { email = '', password = '' } = req.body;
  const errors = [];
  if (email === '') {
    errors.push({
      email: 'invalid value',
    });
  }
  if (password === '') {
    errors.push({
      password: 'invalid value',
    });
  }
  if (errors.length) return res.status(422).json(errors);
  try {
    const user = await BizUser.findOne({ where: { email } });
    if (!user) return res.status(400).json({ errors: [{ user: 'not found' }] });
    const valid = user.validatePassword(password);
    if (valid) {
      const { token, ...json } = user.toAuthJSON();
      res.cookie('token', token, {
        httpOnly: true,
        secure: config.isProd,
        maxAge: 1000 * 60 * 60 * 3, // 3 hours
      });
      return res.json(json);
    }
    return res.status(400).json({
      errors: [
        {
          user: 'not found',
        },
      ],
    });
  } catch (err) {
    next(err);
  }
});

bizUser.post('/user', auth.required, auth.bizUser, async (req, res, next) => {
  const user = req.body.user as BizUser;
  if (!['root', 'admin'].includes(user.role)) {
    return res.status(401).json({
      errors: [
        {
          auth: 'underprivileged access right',
        },
      ],
    });
  }
  const { username, role, email, password } = req.body;
  if (role === 'root') {
    return res.status(422).json({
      errors: [
        {
          role: 'only one root account is allowed',
        },
      ],
    });
  }
  const newUser = BizUser.build({
    username,
    role,
    email,
  });
  newUser.setPassword(password);
  try {
    await newUser.validate();
    const saved = await newUser.save();
    transporter
      .sendMail({
        to: saved.email,
        cc: user.email,
        subject: `Welcome ${saved.username} to join Jobs Hunter`,
        html: bizUsercreatedMail,
      })
      .then(() => {
        res.json({
          user: saved.toJSON(),
        });
      })
      .catch((err) => {
        res.json({
          user: saved.toJSON(),
          mailError: err,
        });
      });
  } catch (err) {
    next(err);
  }
});

bizUser.get('/user', auth.required, auth.bizUser, (req, res, next) => {
  const user = req.body.user as BizUser;
  const { username, role, email, offset = 0, limit = 20 } = req.query;
  const where: WhereOptions = {};
  if (username) {
    where.username = {
      [Op.like]: `%${username}%`,
    };
  }
  if (role) {
    where.role = role;
  }
  if (email) {
    where.email = {
      [Op.like]: `%${email}%`,
    };
  }
  where.bizReg = user.bizReg;
  BizUser.findAndCountAll({
    where,
    offset: +offset,
    limit: +limit > 20 ? 20 : +limit,
  })
    .then((bizUsers) => {
      return res.json(bizUsers);
    })
    .catch(next);
});

bizUser.get('/user/:id', auth.required, auth.bizUser, (req, res, next) => {
  const user = req.body.user as BizUser;
  const findId = req.params;
  BizUser.findOne({
    where: {
      bizReg: user.bizReg,
      id: findId,
    },
  })
    .then((found) => {
      if (!found) return res.json({ errors: [{ user: 'not found' }] });
      const { token, ...json } = found.toAuthJSON();
      return res.json(json);
    })
    .catch(next);
});

bizUser.delete('/user/:id', auth.required, auth.bizUser, (req, res, next) => {
  const user = req.body.user as BizUser;
  const findId = req.params;
  BizUser.findOne({
    where: {
      bizReg: user.bizReg,
      id: findId,
    },
  }).then((found) => {
    if (!found) return res.json({ errors: [{ user: 'not found' }] });
    if (['root', 'admin'].includes(user.role) || user.id === found.id) {
      if (found.role === 'root') {
        return res
          .status(406)
          .json({ errors: [{ root: 'delete is not allowed' }] });
      }
      found
        .destroy()
        .then(() => {
          return res.sendStatus(200);
        })
        .catch(next);
    } else {
      return res.status(401).json({ errors: [{ action: 'not allowed' }] });
    }
  });
});

bizUser.put('/', auth.required, auth.bizUser, async (req, res, next) => {
  const user = req.body.user as BizUser;
  const { username, password } = req.body;
  if (username) user.username = username;
  if (password) {
    user.setPassword(password);
    user.lastPasswordUpdated = new Date();
  }
  try {
    await user.validate();
    const saved = await user.save();
    const { token, ...json } = saved.toAuthJSON();
    res.cookie('token', '', {
      httpOnly: true,
      secure: config.isProd,
      maxAge: 1000,
    });
    if (password) {
      transporter
        .sendMail({
          to: saved.email,
          subject: 'Password Changed',
          html: passwordChangedTemplate,
        })
        .then((mail) => {
          logger.info(mail);
        })
        .catch((err) => logger.debug(err));
    }
    return res.json(json);
  } catch (err) {
    next(err);
  }
});

export default bizUser;
