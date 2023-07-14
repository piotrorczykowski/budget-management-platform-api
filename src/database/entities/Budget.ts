import { Entity, Enum, ManyToOne, Property, Unique } from '@mikro-orm/core'
import CustomBaseEntity from './CustomBaseEntity'
import { IsDate, IsEnum, Length } from 'class-validator'
import User from './User'
import { Category } from '../enums'

@Entity()
export default class Budget extends CustomBaseEntity {
    @Property({
        length: 30,
    })
    @Unique()
    @Length(5, 30)
    name!: string

    @Property({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
    planned!: number

    @Property({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
    spent: number = 0.0

    @Property()
    @IsDate()
    startDate!: Date

    @Property()
    @IsDate()
    endDate!: Date

    @Enum({ items: () => Category, array: true })
    @IsEnum(Category)
    categories!: Category[]

    @ManyToOne(() => User, { onDelete: 'cascade' })
    user!: User
}
