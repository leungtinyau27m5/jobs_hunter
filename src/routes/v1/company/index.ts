import { Router } from 'express';
import Company from '../../../models/company';

const companyRouter = Router();

companyRouter.param('bizRegNumber', (req, res, next, bizRegNumber) => {
  Company.findOne({
    where: {
      bizRegNumber: bizRegNumber,
    },
  })
    .then((company) => {
      req.body.company = company;
      next();
    })
    .catch(next);
});

companyRouter.get('/:bizRegNumber', (req, res) => {
  const company = req.body.company as Company;
  res.json(company.toPublic());
});

export default companyRouter;
