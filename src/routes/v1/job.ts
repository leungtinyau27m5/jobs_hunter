import { Router } from 'express';
import { Includeable, Op, WhereOptions } from 'sequelize';
import auth from '../../middlewares/auth';
import BizUser from '../../models/bizUser';
import Company from '../../models/company';
import Job from '../../models/job';
import JobApplication from '../../models/jobApplication';
import JobCategory from '../../models/jobCat';
import User from '../../models/user';

const jobRouter = Router();

jobRouter.get('/', auth.optional, async (req, res, next) => {
  const {
    offset = 0,
    limit = 20,
    categoryId = null,
    bizReg = null,
    minSalary = null,
    maxSalary = null,
    currency = 'HKD',
  } = req.query;
  const where: WhereOptions = {
    status: 'active',
  };
  const include: Includeable[] = [
    {
      model: Company,
      attributes: ['name', 'description', 'bizReg', 'district'],
      as: 'company',
    },
    {
      model: JobCategory,
      attributes: ['name', 'description'],
      as: 'category',
    },
  ];
  if (req.body.user) {
    include.push({
      model: JobApplication,
      as: 'applications',
      where: {
        userId: req.body.user.id,
      },
    });
  }
  if (categoryId !== null) where.categoryId = categoryId;
  if (bizReg !== null) where.bizReg = bizReg;
  if (minSalary)
    where.minSalary = {
      [Op.gte]: minSalary,
    };
  if (maxSalary) {
    where.minSalary = {
      [Op.lte]: maxSalary,
    };
  }
  if (currency) {
    where.currency = currency;
  }
  try {
    const jobs = await Job.findAndCountAll({
      attributes: {
        exclude: ['minSalary', 'maxSalary'],
      },
      where,
      offset: +offset,
      include: include,
      limit: +limit > 20 ? +limit : +limit,
    });
    return res.json(jobs);
  } catch (err) {
    return next(err);
  }
});

jobRouter.get('/apply/:jobId', auth.required, async (req, res, next) => {
  Job.findOne({
    where: {
      id: req.params.jobId,
      status: 'active',
    },
  }).then(async (job) => {
    if (!job) return res.status(406).json({ errors: [{ job: 'not found' }] });
    if (req.body.user.bizReg)
      return res
        .status(406)
        .json({ errors: [{ user: 'biz user account is not allowed' }] });
    const user = req.body.user as User;
    const application = JobApplication.build({
      userId: user.id,
      jobId: job.id,
      bizReg: job.bizReg,
    });
    try {
      await application.validate();
      application.save().then((saved) => {
        return res.json(saved);
      });
    } catch (err) {
      return next(err);
    }
  });
});

jobRouter.post('/', auth.required, auth.bizUser, async (req, res, next) => {
  const user = req.body.user as BizUser;
  const { title, description } = req.body;
  if (!['root', 'admin'].includes(user.role)) {
    return res.status(401).json({
      errors: [
        {
          auth: 'underprivileged access right',
        },
      ],
    });
  }
  try {
    const job = Job.build({
      title,
      description,
      bizReg: user.bizReg,
      lastUpdatedBy: user.id,
    });
    await job.validate();
    const saved = await job.save();
    return res.json(saved);
  } catch (err) {
    next(err);
  }
});

jobRouter.put(
  '/:jobId',
  auth.required,
  auth.bizUser,
  async (req, res, next) => {
    Job.findOne({
      where: {
        id: req.params.jobId,
        bizReg: req.body.user.bizReg,
      },
    })
      .then(async (job) => {
        if (!job)
          return res.status(400).json({ errors: [{ job: 'not found' }] });
        const {
          status,
          title,
          description,
          minSalary,
          maxSalary,
          currency = 'HKD',
        } = req.body;
        if (status) job.status = status;
        if (title) job.title = title;
        if (description) job.description = description;
        if (minSalary) job.minSalary = +minSalary;
        if (maxSalary) job.maxSalary = +maxSalary;
        if (currency) job.currency = currency;
        try {
          await job.validate();
          const saved = await job.save();
          return res.json(saved);
        } catch (err) {
          next(err);
        }
      })
      .catch(next);
  }
);

jobRouter.delete(
  '/:jobId',
  auth.required,
  auth.bizUser,
  auth.sameBiz,
  (req, res, next) => {
    const user = req.body.user as BizUser;
    Job.findOne({
      where: {
        id: req.params.jobId,
        bizReg: user.bizReg,
      },
    })
      .then(async (job) => {
        if (!job)
          return res.status(400).json({ errors: [{ job: 'not found' }] });
        if (!['admin', 'root'].includes(user.role)) {
          return res
            .status(401)
            .json({ errors: [{ auth: 'underprivileged access right' }] });
        }
        try {
          await job.destroy();
          return res.sendStatus(200);
        } catch (err) {
          return next(err);
        }
      })
      .catch(next);
  }
);

export default jobRouter;
