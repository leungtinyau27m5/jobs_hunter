import { Router } from 'express';
import logger from '../../../common/logger';
import config from '../../../config';
import transporter from '../../../mailer';
import { passwordChangedTemplate } from '../../../mailer/templates/users';
import auth from '../../../middlewares/auth';
import User from '../../../models/user';

const singleUserRouter = Router();

/**
 * @apiVersion 1.0.0
 * @api {get} /api/v1/user
 * @apiGroup singleUser
 * @apiName GetUserByToken
 */
singleUserRouter.get('/', auth.required, (req, res) => {
  res.json({ ...req.body.user });
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

export default singleUserRouter;
