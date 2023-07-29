import { Cascade, Collection, Entity, Index, ManyToOne, OneToMany, Property } from '@mikro-orm/core'
import CustomBaseEntity from './CustomBaseEntity'
import { Length } from 'class-validator'
import User from './User'
import Record from './Record'
import WithSoftDelete from '../utils/withSoftDelete'
import HistoricalAccountBalance from './HistoricalAccountBalance'

@Entity()
@WithSoftDelete()
export default class Account extends CustomBaseEntity {
    @Property({
        length: 30,
    })
    @Length(5, 30)
    name!: string

    @Property({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
    balance!: number

    @Index()
    @Property({ nullable: true, type: 'timestamptz' })
    deletedAt?: Date

    @ManyToOne({ onDelete: 'cascade' })
    user!: User

    @OneToMany(() => Record, (record) => record.account, { cascade: [Cascade.REMOVE] })
    records = new Collection<Record>(this)

    @OneToMany(() => HistoricalAccountBalance, (HistoricalAccountBalance) => HistoricalAccountBalance.account, {
        cascade: [Cascade.REMOVE],
    })
    historicalAccountBalances = new Collection<HistoricalAccountBalance>(this)
}
