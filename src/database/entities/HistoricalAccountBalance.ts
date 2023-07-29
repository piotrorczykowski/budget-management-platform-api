import { Entity, ManyToOne, Property } from '@mikro-orm/core'
import CustomBaseEntity from './CustomBaseEntity'
import { IsDate } from 'class-validator'
import Account from './Account'

@Entity()
export default class HistoricalAccountBalance extends CustomBaseEntity {
    @Property({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
    balance!: number

    @Property()
    @IsDate()
    date!: Date

    @ManyToOne(() => Account, { onDelete: 'cascade' })
    account!: Account
}
