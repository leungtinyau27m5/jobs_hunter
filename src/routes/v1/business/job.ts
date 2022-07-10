import { Router } from "express";
import { WhereOptions } from "sequelize";
import auth from "../../../middlewares/auth";
import BizUser from "../../../models/bizUser";
import Job from "../../../models/job";

const jobRouter = Router();

jobRouter.get("/", auth.optional, async (req, res, next) => {
  const { offset = 0, limit = 20, categoryId = null } = req.query;
  const where: WhereOptions = {};
  if (categoryId !== null) where.categoryId = categoryId;
  try {
    const jobs = await Job.findAll({
      where,
      offset: +offset,
      limit: +limit > 20 ? +limit : +limit,
    });
    return res.json(jobs);
  } catch (err) {
    return next(err);
  }
});

jobRouter.post("/", auth.required, auth.bizUser, async (req, res, next) => {
  const user = req.body.user as BizUser;
  const { title, description } = req.body;
  if (!["root", "admin"].includes(user.role)) {
    return res.status(401).json({
      errors: [
        {
          auth: "underprivileged access right",
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
  "/:jobId",
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
          return res.status(400).json({ errors: [{ job: "not found" }] });
        const { status, title, description } = req.body;
        if (status) job.status = status;
        if (title) job.title = title;
        if (description) job.description = description;
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

jobRouter.delete("/:jobId", auth.required, auth.bizUser, (req, res, next) => {
  const user = req.body.user as BizUser;
  Job.findOne({
    where: {
      id: req.params.jobId,
      bizReg: user.bizReg,
    },
  })
    .then(async (job) => {
      if (!job) return res.status(400).json({ errors: [{ job: "not found" }] });
      if (!["admin", "root"].includes(user.role)) {
        return res
          .status(401)
          .json({ errors: [{ auth: "underprivileged access right" }] });
      }
      try {
        await job.destroy();
        return res.sendStatus(200);
      } catch (err) {
        return next(err);
      }
    })
    .catch(next);
});

export default jobRouter;
