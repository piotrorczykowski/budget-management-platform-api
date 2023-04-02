import { MikroORM, MySqlDriver } from '@mikro-orm/mysql'
import ormConfig from './mikro-orm.config'

const initializeORM = async () => await MikroORM.init<MySqlDriver>(ormConfig)

export default initializeORM
