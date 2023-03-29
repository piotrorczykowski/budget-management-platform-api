import { Options } from '@mikro-orm/core'
import { config } from './config'

const ormConfig: Options = {
    type: 'mysql',
    dbName: config.dbName,
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPassword,
    port: config.dbPort,
    entitiesTs: ['./src/database/entities'],
    entities: ['./dist/database/entities'],
    forceUtcTimezone: true,
    tsNode: true,
    debug: true,
    migrations: {
        tableName: 'mikro_orm_migrations',
        pathTs: process.cwd() + '/src/database/migrations',
        path: process.cwd() + '/dist/database/migrations',
        glob: '!(*.d).{js,ts}',
        transactional: true,
        disableForeignKeys: false,
        allOrNothing: true,
        snapshot: false,
        emit: 'ts',
    },
}

export default ormConfig
