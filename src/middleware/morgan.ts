import morgan from 'koa-morgan'
import logger from './winston'

const morganMiddleware = morgan(':method :url :status', {
    stream: {
        write: (message) => logger.http(message.trim()),
    },
})

export default morganMiddleware
