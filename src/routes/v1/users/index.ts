import { Router } from "express";
import config from "../../../config";
import User from "../../../models/user";

const usersRouter = Router();

usersRouter.post("/register", async (req, res, next) => {
  const { email = "", password = "", username = "" } = req.body;
  const errors = [];
  if (typeof username !== "string" || username === "") {
    errors.push({
      username: "invalid value",
    });
  }
  if (typeof email !== "string" || email === "") {
    errors.push({
      email: "invalid value",
    });
  }
  if (typeof password !== "string" || password === "") {
    errors.push({
      password: "invalid value",
    });
  } else if (password.length < 8) {
    errors.push({
      password: "min length is 8",
    });
  } else if (password.length > 16) {
    errors.push({
      password: "max length is 16",
    });
  }
  if (errors.length) return res.status(422).json(errors);
  const user = User.build({
    username,
    email,
  });
  user.setPassword(password);
  try {
    await user.validate();
    const saved = await user.save();
    const { token, ...json } = saved.toJSON();
    res.cookie("token", token, {
      httpOnly: true,
      secure: config.isProd,
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30days
    });
    return res.json(json);
  } catch (err) {
    console.log("creat error??", err);
    return next(err);
  }
});

usersRouter.post("/login", async (req, res, next) => {
  const { email = "", password = "" } = req.body;
  const errors = [];
  if (email === "") {
    errors.push({
      email: "invalid value",
    });
  }
  if (password === "") {
    errors.push({
      password: "invalid value",
    });
  }
  if (errors.length) return res.status(422).json(errors);
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ errors: [{ user: "not found" }] });
    const valid = user.validatePassword(password);
    if (valid) {
      const { token, ...json } = user.toJSON();
      res.cookie("token", token, {
        httpOnly: true,
        secure: config.isProd,
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30days
      });
      return res.json(json);
    }
    return res.status(400).json({
      errors: [
        {
          user: "not found",
        },
      ],
    });
  } catch (err) {
    next(err);
  }
});

export default usersRouter;
