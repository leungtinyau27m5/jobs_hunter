declare namespace Express {
  interface Request {
    token?: string;
    user?: {
      id: number;
      username: string;
      email: string;
      issueAt: number;
      role?: string;
      bizReg?: number;
    };
  }
}
