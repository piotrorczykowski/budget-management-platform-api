import { MikroORM } from '@mikro-orm/mysql'
import ormConfig from './mikro-orm.config'

const initializeORM = async () => await MikroORM.init(ormConfig)

export default initializeORM
