export default {
  port: +process.env.PORT || 8000,
  dbHost: process.env.DB_HOST || 'localhost',
  dbPort: +process.env.DB_PORT || 3306,
  dbUser: process.env.DB_USER || 'root',
  dbPassword: process.env.DB_PASSWORD || '!Password',
  dbSchema: process.env.DB_SCHEMA || 'jobs_hunter'
}