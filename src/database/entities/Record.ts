import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/core'
import CustomBaseEntity from './CustomBaseEntity'
import { IsDate, IsEnum, Min } from 'class-validator'
import { Category } from '../enums'
import Account from './Account'

@Entity()
export default class Record extends CustomBaseEntity {
    @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    @Min(0)
    amount!: number

    @Property()
    @IsDate()
    date!: Date

    @Property()
    isExpense: boolean = true

    @Enum({
        items: () => Category,
    })
    @IsEnum(Category)
    category: Category = Category.Other

    @Property({
        length: 255,
    })
    description?: string

    @ManyToOne(() => Account, { onDelete: 'cascade' })
    account!: Account
}
