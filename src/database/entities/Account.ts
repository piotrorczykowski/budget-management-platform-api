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

    @Property()
    balance!: number

    @ManyToOne({ onDelete: 'cascade' })
    user!: User
}
