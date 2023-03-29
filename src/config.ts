interface IConfig {
    port: number
    dbName: string
    dbHost: string
    dbUser: string
    dbPassword: string
    dbPort: number
}

export const config: IConfig = {
    port: Number(process.env.PORT) || 0,
    dbName: process.env.DATABASE_NAME || '',
    dbHost: process.env.DATABASE_HOST || '',
    dbUser: process.env.DATABASE_USER || '',
    dbPassword: process.env.DATABASE_PASSWORD || '',
    dbPort: Number(process.env.DATABASE_PORT) || 0,
}
