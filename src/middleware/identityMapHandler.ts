import { AwilixContainer } from 'awilix'
import { registerRepositories } from '../awilix'
import { getContainer } from '../server'

const identityMapHandler = async (ctx, next) => {
    const container: AwilixContainer = getContainer()
    const orm = container.resolve('orm')
    await registerRepositories(ctx.state.container, orm)
    await next()
}

export default identityMapHandler
