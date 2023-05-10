import { createLogger, format, transports } from 'winston'

const consoleLogger = new transports.Console({
    level: 'http',
    format: format.combine(
        format.colorize({ level: true }),
        format.timestamp(),
        format.printf((info) => `${info.timestamp} - ${info.level}: ${info.message}`)
    ),
})

const logger = createLogger({
    level: 'info',
    transports: [consoleLogger],
    exitOnError: false,
})

export default logger
