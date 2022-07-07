import { Router } from 'express';
import config from '../../../config';
import BizUser from '../../../models/bizUser';
import Company from '../../../models/company';

const biz = Router();

biz.post('/create', async (req, res, next) => {
  const { root, company } = req.body;
  const { bizRegNumber, name, description, district } = company;
  const { username, role, email, password } = root;
  const biz = Company.build({
    bizRegNumber,
    name,
    description,
    district,
  });
  try {
    await biz.validate();
    const savedBiz = await biz.save();
    const bizUser = BizUser.build({
      username,
      role,
      email,
      bizRegNumber,
    });
    bizUser.setPassword(password);
    const savedBizUser = await bizUser.save();
    const { token, ...user } = savedBizUser.toJSON();
    res.cookie('token', token, {
      httpOnly: true,
      secure: config.isProd,
      maxAge: 1000 * 60 * 60 * 3, // 3hours
    });
    return res.json({ biz: savedBiz, user });
  } catch (err) {
    next(err);
  }
});

export default biz;
