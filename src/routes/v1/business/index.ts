import { Router } from 'express';
import config from '../../../config';
import BizUser from '../../../models/bizUser';
import Company from '../../../models/company';

const biz = Router();

biz.post('/create', async (req, res, next) => {
  const { root, company } = req.body;
  const { bizReg, name, description, district } = company;
  const { username, email, password } = root;
  const biz = Company.build({
    bizReg,
    name,
    description,
    district,
  });
  let savedBiz: Company;
  try {
    await biz.validate();
    savedBiz = await biz.save();
  } catch (err) {
    return next(err);
  }
  try {
    const bizUser = BizUser.build({
      username,
      role: 'root',
      email,
      bizReg,
    });
    bizUser.setPassword(password);
    const savedBizUser = await bizUser.save();
    const { token, ...user } = savedBizUser.toAuthJSON();
    res.cookie('token', token, {
      httpOnly: true,
      secure: config.isProd,
      maxAge: 1000 * 60 * 60 * 3, // 3hours
    });
    return res.json({ biz: savedBiz, user });
  } catch (err) {
    savedBiz.destroy();
    next(err);
  }
});

export default biz;
