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
import errorHandler from './middlewares/errorHandler'

initializeORM()
    .then(async (orm: MikroORM<MySqlDriver>) => {
        const app: Koa = new Koa()
        const container: AwilixContainer = await initContainer(orm)

        app.use(errorHandler)

        app.use(scopePerRequest(container))

        app.use(bodyParser())

        const controllersPath: string = 'modules/**/*Controller.ts'
        app.use(loadControllers(controllersPath, { cwd: __dirname }))

        app.listen(config.port)
    })
    .catch((e) => {
        console.log(e)
    })
