import { Router } from 'express';
import Company from '../../../models/company';

const companyRouter = Router();

companyRouter.param('bizReg', (req, res, next, bizReg) => {
  Company.findOne({
    where: {
      bizReg: bizReg,
    },
  })
    .then((company) => {
      req.body.company = company;
      next();
    })
    .catch(next);
});

companyRouter.get('/:bizReg', (req, res) => {
  const company = req.body.company as Company;
  res.json(company.toPublic());
});

export default companyRouter;
