declare namespace Express {
  interface Request {
    token?: string;
    user?: {
      id: number;
      username: string;
      email: string;
      role?: string;
      bizReg?: number;
    };
  }
}
