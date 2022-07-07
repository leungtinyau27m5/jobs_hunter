import { Router } from 'express';
import config from '../../../config';
import auth from '../../../middlewares/auth';
import User from '../../../models/user';

const singleUserRouter = Router();

singleUserRouter.get('/', auth.required, (req, res) => {
  res.json({ ...req.user });
});

singleUserRouter.put('/', auth.required, async (req, res, next) => {
  const user = req.body.user as User;
  const { username, password } = req.body;
  if (username) {
    user.username = username;
  }
  if (password) {
    user.setPassword(password);
  }
  try {
    await user.validate();
    const saved = await user.save();
    const { token, ...json } = saved.toJSON();
    res.cookie('token', token, {
      httpOnly: true,
      secure: config.isProd,
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30days
    });
    return res.json(json);
  } catch (err) {
    next(err);
  }
});

export default singleUserRouter;
