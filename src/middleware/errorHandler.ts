import logger from './winston'

const errorHandler = async (ctx, next) => {
    try {
        await next()
    } catch (error) {
        ctx.status = 400
        ctx.body = { Error: error.message }
        logger.error(error.message)
    }
}

export default errorHandler
