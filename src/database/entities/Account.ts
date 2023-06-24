import { Cascade, Collection, Entity, ManyToOne, OneToMany, Property, Unique } from '@mikro-orm/core'
import CustomBaseEntity from './CustomBaseEntity'
import { Length } from 'class-validator'
import User from './User'
import Record from './Record'

@Entity()
export default class Account extends CustomBaseEntity {
    @Property({
        length: 30,
    })
    @Unique()
    @Length(5, 30)
    name!: string

    @Property({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
    balance!: number

    @ManyToOne({ onDelete: 'cascade' })
    user!: User

    @OneToMany(() => Record, (record) => record.account, { cascade: [Cascade.REMOVE] })
    records = new Collection<Record>(this)
}
