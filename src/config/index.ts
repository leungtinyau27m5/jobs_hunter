export default {
  isProd: process.env.NODE_END === "production",
  secret: process.env.SECRET || "GS3tUUYlBWA1s5J9",
  cookieSecret: process.env.COOKIE_SECRET || "QfTjWnZr4u7x",
  port: process.env.PORT || 8000,
  dbHost: process.env.DB_HOST || "localhost",
  dbPort: process.env.DB_PORT || 3306,
  dbUser: process.env.DB_USER || "root",
  dbPassword: process.env.DB_PASSWORD || "!Password",
  dbSchema: process.env.DB_SCHEMA || "jobs_hunter",
  logDir: process.env.LOG_DIR || "dev_log",
};
