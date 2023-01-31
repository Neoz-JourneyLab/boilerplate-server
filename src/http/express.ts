import express, {Express} from 'express'
import bodyParser from 'body-parser'
import {Test} from './post/test'
import {Autentication} from './post/authentication'
import chalk from 'chalk'
import {env} from '../env'
import {ServerStatus} from './post/server-status'
import {TestCrypto} from './post/test-crypto'

export const getExpress = ():Express => {
  const app = express()
  app.use(bodyParser.urlencoded({extended: true}))
  app.use(express.json())

  app.post("/test", async (req, res) => {
    try {
      await Test(req, res)
    } catch (e) {
      EndErr(e, res)
    }
  })

  app.post("/authentication", async (req, res) => {
    try {
      await Autentication(req, res)
    } catch (e) {
      EndErr(e, res)
    }
  })

  app.post("/server:status", async (req, res) => {
    try {
      await ServerStatus(req, res)
    } catch (e) {
      EndErr(e, res)
    }
  })

  app.post("/testCrypto", async (req, res) => {
    try {
      await TestCrypto(req, res)
    } catch (e) {
      EndErr(e, res)
    }
  })

  app.listen(env.PORT + 1, () => {
    console.log(chalk.green.bold(`server HTTP started on port ${env.PORT + 1}`))
  })
  return app
}

function EndErr(e: any, res: any) {
  console.error(chalk.red(chalk.bold(`Error : ${e}`)))
  res.status(500)
  let err = (e instanceof Error) ? e.message : "Failed to do something exceptional"
  res.end(err)
}
