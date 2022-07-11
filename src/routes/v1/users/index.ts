import { Router } from 'express';
import config from '../../../config';
import User from '../../../models/user';

const usersRouter = Router();

/**
 * @api {post} /api/v1/users/register Registration
 * @apiVersion 1.0.0
 * @apiGroup Users
 *
 * @apiBody {String} email unique email
 * @apiBody {String} password 8 - 16 long characters for <code>hash</code> and <code>salt</code>
 * @apiBody {String} username user nick name
 *
 * @apiUse InvalidValue
 * @apiUse UnkonwnError
 *
 * @apiSuccess {Object} User 200
 * @apiSuccess {Number} User.id user unique id
 * @apiSuccess {String} User.username user nickname
 * @apiSuccess {String} User.email user unique email
 */
usersRouter.post('/register', async (req, res, next) => {
  const { email = '', password = '', username = '' } = req.body;
  const errors = [];
  if (typeof username !== 'string' || username === '') {
    errors.push({
      username: 'invalid value',
    });
  }
  if (typeof email !== 'string' || email === '') {
    errors.push({
      email: 'invalid value',
    });
  }
  if (typeof password !== 'string' || password === '') {
    errors.push({
      password: 'invalid value',
    });
  } else if (password.length < 8) {
    errors.push({
      password: 'min length is 8',
    });
  } else if (password.length > 16) {
    errors.push({
      password: 'max length is 16',
    });
  }
  if (errors.length) return res.status(422).json(errors);
  const user = User.build({
    username,
    email,
  });
  user.setPassword(password);
  try {
    await user.validate();
    const saved = await user.save();
    const { token, ...json } = saved.toAuthJSON();
    res.cookie('token', token, {
      httpOnly: true,
      secure: config.isProd,
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30days
    });
    return res.json(json);
  } catch (err) {
    return next(err);
  }
});

/**
 * @api {post} /api/v1/users/login Login
 * @apiVersion 1.0.0
 * @apiGroup Users
 *
 * @apiBody {String} email
 * @apiBody {String} password
 *
 * @apiUse InvalidValue
 * @apiUse UnAuthorized
 * @apiUse UserAuthObject
 * @apiUse UnkonwnError
 *
 */
usersRouter.post('/login', async (req, res, next) => {
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
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ errors: [{ user: 'not found' }] });
    const valid = user.validatePassword(password);
    if (valid) {
      const { token, ...json } = user.toAuthJSON();
      res.cookie('token', token, {
        httpOnly: true,
        secure: config.isProd,
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30days
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

export default usersRouter;
