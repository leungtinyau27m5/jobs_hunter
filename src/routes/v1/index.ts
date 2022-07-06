import { Router } from "express";
import userRouter from "./user";
import usersRouter from "./users";

const v1 = Router();

v1.use("/users", usersRouter);
v1.use("/user", userRouter);

export default v1;
