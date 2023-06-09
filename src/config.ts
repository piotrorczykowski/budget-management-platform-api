interface IConfig {
    port: number
    dbName: string
    dbHost: string
    dbUser: string
    dbPassword: string
    dbPort: number
    jwtSecret: string
    frontendUrl: string
    backendUrl: string
    emailUsername: string
    emailPassword: string
    emailFrom: string
}

export const config: IConfig = {
    port: Number(process.env.PORT) || 0,
    dbName: process.env.DATABASE_NAME || '',
    dbHost: process.env.DATABASE_HOST || '',
    dbUser: process.env.DATABASE_USER || '',
    dbPassword: process.env.DATABASE_PASSWORD || '',
    dbPort: Number(process.env.DATABASE_PORT) || 0,
    jwtSecret: process.env.JWT_SECRET || '',
    frontendUrl: process.env.FRONTEND_URL || '',
    backendUrl: process.env.BACKEND_URL || '',
    emailUsername: process.env.EMAIL_USERNAME || '',
    emailPassword: process.env.EMAIL_PASSWORD || '',
    emailFrom: process.env.EMAIL_FROM || '',
}
