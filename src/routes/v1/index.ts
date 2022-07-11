import { Router } from "express";
import biz from "./business";
import bizUser from "./business/bizUser";
import jobRouter from "./job";
import singleUserRouter from "./singleUser";
import usersRouter from "./users";

const v1 = Router();

v1.use("/users", usersRouter);
v1.use("/user", singleUserRouter);
v1.use("/biz", biz);
v1.use("/bizUser", bizUser);
v1.use("/job", jobRouter);

export default v1;
