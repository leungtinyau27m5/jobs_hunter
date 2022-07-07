import { Router } from 'express';
import BizUser from '../../../models/bizUser';
import Job from '../../../models/job';

const bizUser = Router();

bizUser.post('/job', async (req, res, next) => {
  const bizUser = req.body.user as BizUser;
  const { title, description } = req.body;
  const job = Job.build({
    title,
    description,
    bizRegNumber: bizUser.bizRegNumber,
  });
  try {
    await job.validate();
    const saved = await job.save();
    return res.json(saved);
  } catch (err) {
    next(err);
  }
});

bizUser.post('/user', async (req, res, next) => {
  const bizUser = req.body.user as BizUser;
  if (!['root', 'admin'].includes(bizUser.role)) {
    return res.status(401).json({
      errors: [
        {
          auth: 'underprivileged access right',
        },
      ],
    });
  }
  const { username, role, email, password } = req.body;
  if (role === 'root') {
    return res.status(422).json({
      errors: [
        {
          role: 'only one root account is allowed',
        },
      ],
    });
  }
  const user = BizUser.build({
    username,
    role,
    email,
  });
  user.setPassword(password);
  try {
    await user.validate();
    const saved = await user.save();
    res.json(saved.toJSON());
  } catch (err) {
    next(err);
  }
});

export default bizUser;
