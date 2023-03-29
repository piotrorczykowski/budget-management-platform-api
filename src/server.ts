import dotenv from 'dotenv'
dotenv.config()
import 'reflect-metadata'
import Koa from 'koa'
import { createContainer, Lifetime } from 'awilix'
import { loadControllers, scopePerRequest } from 'awilix-koa'
import initializeORM from './connection'
import { config } from './config'

initializeORM()
    .then(async () => {
        const app = new Koa()
        const container = createContainer()

        const servicesPath: string = './modules/**/*Service.ts'
        container.loadModules([[servicesPath, Lifetime.SCOPED]], {
            cwd: __dirname,
            formatName: 'camelCase',
        })

        app.use(scopePerRequest(container))

        const controllersPath: string = 'modules/**/*Controller.ts'
        app.use(loadControllers(controllersPath, { cwd: __dirname }))

        app.listen(config.port)
    })
    .catch((e) => {
        console.log(e)
    })
