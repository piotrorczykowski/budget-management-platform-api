import { AwilixContainer, Lifetime, asValue, createContainer } from 'awilix'
import { EntityRepository, MikroORM } from '@mikro-orm/core'
import { MySqlDriver } from '@mikro-orm/mysql'
import _ from 'lodash'
import { config } from './config'
import StringUtils from './utils/stringUtils'

export const initContainer = async (orm: MikroORM<MySqlDriver>): Promise<AwilixContainer> => {
    const container: AwilixContainer = createContainer()
    registerServices(container)
    await registerRepositories(container, orm)

    return container
}

const registerServices = (container: AwilixContainer): void => {
    const servicesPath: string = './modules/**/*Service.ts'
    container.loadModules([[servicesPath, Lifetime.SCOPED]], {
        cwd: __dirname,
        formatName: 'camelCase',
    })
}

const registerRepositories = async (container: AwilixContainer, orm: MikroORM<MySqlDriver>): Promise<void> => {
    const tablesNames: string[] = await getTablesNames(orm)
    for (const tableName of tablesNames) {
        const entityName: string = StringUtils.toPascalCase(tableName)
        const repository: EntityRepository<any> = orm.em.getRepository(entityName)

        const repositoryName: string = _.camelCase(tableName) + 'Repository'
        container.register(repositoryName, asValue(repository))
    }
}

const getTablesNames = async (orm: MikroORM<MySqlDriver>) => {
    const tablesNames: string[] = (
        await orm.em.execute(
            `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA IN ('${config.dbName}') AND TABLE_NAME NOT LIKE('%mikro_orm_migrations%')`
        )
    ).map((obj) => obj.TABLE_NAME)

    return tablesNames
}
