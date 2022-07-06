import express from 'express'
import Database from './common/database'

const app = express()

Database.authenticate().then(() => {
  Database.sync({ alter: true }).then(() => {
    app.listen(process.env.PORT, () => {
      console.log("server is on: ", process.env.PORT)
    })
  }).catch(err => console.log(err))
}).catch(err => console.log(err))
