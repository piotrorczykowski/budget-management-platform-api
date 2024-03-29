import dotenv from 'dotenv'
dotenv.config()
import 'reflect-metadata'
import Koa from 'koa'
import { AwilixContainer } from 'awilix'
import { loadControllers, scopePerRequest } from 'awilix-koa'
import { MikroORM } from '@mikro-orm/core'
import { MySqlDriver } from '@mikro-orm/mysql'
import cors from '@koa/cors'
import bodyParser from 'koa-bodyparser'
import passport from './passport'
import initializeORM from './connection'
import { initContainer } from './awilix'
import { config } from './config'
import errorHandler from './middleware/errorHandler'
import identityMapHandler from './middleware/identityMapHandler'
import morganMiddleware from './middleware/morgan'
import logger from './winston'
import authMiddleware from './middleware/authMiddleware'
import CronJobsService from './modules/cronJob/cronJobsService'

let container: AwilixContainer = null

initializeORM()
    .then(async (orm: MikroORM<MySqlDriver>) => {
        logger.info('Starting')
        const app: Koa = new Koa()
        container = await initContainer(orm)

        app.use(
            cors({
                origin: config.frontendUrl,
            })
        )

        app.use(scopePerRequest(container))

        app.use(identityMapHandler)

        app.use(errorHandler)
        app.use(morganMiddleware)

        app.use(bodyParser())

        passport()
        app.use(authMiddleware)

        const controllersPath: string = 'modules/**/*Controller.ts'
        app.use(loadControllers(controllersPath, { cwd: __dirname }))

        app.listen(config.port)
        logger.info(`Server is listening on port: ${config.port}...`)

        const cronJobsService: CronJobsService = container.resolve('cronJobsService')
        cronJobsService.saveHistoricalAccountBalanceJob().start()
    })
    .catch((error) => {
        logger.error(error.message)
    })

export const getContainer = () => {
    return container
}
