import { Router } from 'express';
import logger from '../../../common/logger';
import config from '../../../config';
import transporter from '../../../mailer';
import { passwordChangedTemplate } from '../../../mailer/templates/users';
import auth from '../../../middlewares/auth';
import User from '../../../models/user';
import UserSubscription from '../../../models/userSubscription';

const singleUserRouter = Router();

/**
 * @api {get} /api/v1/user Token
 * @apiVersion 1.0.0
 * @apiGroup SingleUser
 *
 */
singleUserRouter.get('/', auth.required, (req, res) => {
  const { token, ...json } = (req.body.user as User).toAuthJSON();
  res.json(json);
});

/**
 * @api {put} /api/v1/user Update
 * @apiVersion 1.0.0
 * @apiGroup SingleUser
 *
 * @apiBody {String} username
 * @apiBody {String} password
 *
 * @apiUse UnkonwnError
 * @apiUse UnAuthorized
 * @apiUse UserAuthObject
 *
 */
singleUserRouter.put('/', auth.required, async (req, res, next) => {
  const user = req.body.user as User;
  const { username, password } = req.body;
  if (username) {
    user.username = username;
  }
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

/**
 * @api {put} /api/v1/user/subscription Update Subscription
 * @apiVersion 1.0.0
 * @apiGroup SingleUser
 *
 * @apiBody {Boolean} applied default `true`
 * @apiBody {Boolean} reviewed default `true`
 *
 * @apiUse UnkonwnError
 * @apiUse UnAuthorized
 *
 * @apiSuccess (200) {Object} subscription updated subscription
 * @apiSuccess (200) {Number} subscription.userId
 * @apiSuccess (200) {Boolean} subscription.applied
 * @apiSuccess (200) {Boolean} subscription.reviewed
 * @apiSuccess (200) {Date} subscription.createdAt
 * @apiSuccess (200) {Date} subscription.updatedAt
 */
singleUserRouter.put('/subscription', auth.required, async (req, res, next) => {
  const user = req.body.user as User;
  const { applied = true, reviewed = true } = req.body;
  try {
    const subscription = await UserSubscription.findOne({
      where: {
        userId: user.id,
      },
    });
    if (!subscription)
      return res.status(404).json({ errors: [{ subscription: 'not found' }] });
    subscription.applied = applied;
    subscription.reviewed = reviewed;
    await subscription.validate();
    const saved = await subscription.save();
    return res.json(saved);
  } catch (err) {
    return next(err);
  }
});

export default singleUserRouter;
