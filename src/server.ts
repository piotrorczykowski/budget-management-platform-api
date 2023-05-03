import dotenv from 'dotenv'
dotenv.config()
import 'reflect-metadata'
import Koa from 'koa'
import { AwilixContainer } from 'awilix'
import { loadControllers, scopePerRequest } from 'awilix-koa'
import { MikroORM } from '@mikro-orm/core'
import { MySqlDriver } from '@mikro-orm/mysql'
import _ from 'lodash'
import bodyParser from 'koa-bodyparser'
import initializeORM from './connection'
import { initContainer } from './awilix'
import { config } from './config'
import errorHandler from './middleware/errorHandler'
import morganMiddleware from './middleware/morgan'
import logger from './winston'

initializeORM()
    .then(async (orm: MikroORM<MySqlDriver>) => {
        logger.info('Starting')
        const app: Koa = new Koa()
        const container: AwilixContainer = await initContainer(orm)

        app.use(errorHandler)
        app.use(morganMiddleware)

        app.use(scopePerRequest(container))
        app.use(bodyParser())

        const controllersPath: string = 'modules/**/*Controller.ts'
        app.use(loadControllers(controllersPath, { cwd: __dirname }))

        app.listen(config.port)
        logger.info(`Server is listening on port: ${config.port}...`)
    })
    .catch((error) => {
        logger.error(error.message)
    })
