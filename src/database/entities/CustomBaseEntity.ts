import { PrimaryKey, Property } from '@mikro-orm/core'
import { IsDate } from 'class-validator'

export default abstract class CustomBaseEntity {
    @PrimaryKey()
    id!: number

    @Property()
    @IsDate()
    createdAt: Date = new Date()

    @Property({ onUpdate: () => new Date() })
    @IsDate()
    updatedAt: Date = new Date()
}
