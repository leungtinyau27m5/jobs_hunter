import { Router } from 'express';
import { WhereOptions } from 'sequelize';
import logger from '../../../common/logger';
import config from '../../../config';
import auth from '../../../middlewares/auth';
import BizUser from '../../../models/bizUser';
import Company from '../../../models/company';
import Job from '../../../models/job';
import JobApplication from '../../../models/jobApplication';
import JobCategory from '../../../models/jobCat';
import User from '../../../models/user';

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

biz.get(
  '/:bizReg/job',
  auth.required,
  auth.bizUser,
  auth.sameBiz,
  async (req, res, next) => {
    const { offset = 0, limit = 20, categoryId = null } = req.query;
    const where: WhereOptions = {
      status: 'active',
    };
    if (categoryId !== null) where.categoryId = categoryId;
    const { attr = '' } = req.query;
    let attributes = ['title', 'status', 'createdAt', 'minSalary', 'maxSalary'];
    if (typeof attr === 'string' && attr.includes(',') && attr.split(',')) {
      attributes = attr.split(',');
    }
    try {
      const jobs = await Job.findAll({
        where,
        attributes,
        include: [
          {
            model: JobCategory,
            attributes: ['name', 'description'],
            as: 'category',
          },
          {
            model: JobApplication,
            limit: 50,
            attributes: ['userId', 'status'],
            as: 'applications',
          },
        ],
        limit: +limit > 20 ? +limit : +limit,
        offset: +offset,
      });
      Promise.all(
        jobs.map((job) =>
          JobApplication.count({
            where: {
              jobId: job.id,
            },
          })
        )
      )
        .then((counts) => {
          counts.forEach((count, idx) => {
            jobs[idx].setDataValue('totalApplications', count);
          });
          return res.json(jobs);
        })
        .catch(next);
    } catch (err) {
      return next(err);
    }
  }
);

biz.get(
  '/:bizReg/job/:jobId',
  auth.required,
  auth.bizUser,
  auth.sameBiz,
  async (req, res, next) => {
    const user = req.body.user as BizUser;
    const attributes = [
      'title',
      'status',
      'createdAt',
      'minSalary',
      'maxSalary',
    ];
    Job.findOne({
      attributes,
      where: {
        bizReg: user.bizReg,
        id: req.params.jobId,
      },
      include: [
        {
          model: JobApplication,
          as: 'applications',
          attributes: ['createdAt', 'status'],
          include: [
            {
              model: User,
              attributes: ['id', 'username', 'email', 'cv', 'icon'],
              as: 'user',
            },
          ],
        },
      ],
    })
      .then((job) => {
        if (!job)
          return res.status(404).json({ errors: [{ job: 'not found' }] });
        return res.json(job.applications);
      })
      .catch(next);
  }
);

biz.get(
  '/:bizReg/application',
  auth.required,
  auth.bizUser,
  async (req, res, next) => {
    const { offset = 0, limit = 20 } = req.query;
    const bizReg = req.params.bizReg;
    const user = req.body.user as BizUser;
    if (bizReg !== user.bizReg)
      return res
        .status(401)
        .json({ errors: [{ biz: 'not allowed to access' }] });
    JobApplication.findAndCountAll({
      attributes: ['createdAt'],
      offset: +offset,
      limit: +limit > 20 ? 20 : +limit,
      include: [
        {
          model: User,
          attributes: ['icon', 'username', 'email', 'cv'],
          as: 'user',
        },
        {
          model: Job,
          attributes: ['id', 'title', 'status'],
          as: 'job',
        },
      ],
      where: {
        bizReg,
      },
    })
      .then((applications) => {
        return res.json(applications);
      })
      .catch(next);
  }
);

biz.get(
  '/:bizReg/application/:applicationId',
  auth.required,
  auth.bizUser,
  auth.sameBiz,
  async (req, res, next) => {
    const { applicationId } = req.params;
    const [jobId, userId] = applicationId.split('-');
    if (!jobId || !userId)
      return res.status(404).json({
        errors: [
          {
            applicationId: 'not found',
          },
        ],
      });
    try {
      const application = await JobApplication.findOne({
        where: {
          userId,
          jobId,
        },
        attributes: ['createdAt', 'status'],
        include: [
          {
            model: User,
            attributes: ['id', 'username', 'email', 'cv', 'icon'],
            as: 'user',
          },
          {
            model: Job,
            attributes: ['title', 'status'],
            as: 'job',
          },
        ],
      });
      if (!application)
        return res.status(404).json({ errors: [{ application: 'not found' }] });
      res.json(application);
      setTimeout(() => {
        if (application.status === 'sent') {
          application.status = 'reviewed';
          try {
            application.save().catch(logger.debug);
          } catch (err) {
            logger.debug(err);
          }
        }
      }, 1000);
    } catch (err) {
      next(err);
    }
  }
);

export default biz;
