import { Entity, ManyToOne, Property, Unique } from '@mikro-orm/core'
import CustomBaseEntity from './CustomBaseEntity'
import { Length } from 'class-validator'
import User from './User'

@Entity()
export default class Account extends CustomBaseEntity {
    @Property({
        length: 30,
    })
    @Unique()
    @Length(5, 30)
    name!: string

    @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    balance!: number

    @ManyToOne({ onDelete: 'cascade' })
    user!: User
}
