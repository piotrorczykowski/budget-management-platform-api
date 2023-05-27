import { Entity, Enum, Property, Unique } from '@mikro-orm/core'
import CustomBaseEntity from './CustomBaseEntity'
import { IsEmail, IsEnum, Length } from 'class-validator'
import { UserRole } from '../enums'

@Entity()
export default class User extends CustomBaseEntity {
    @Property({
        length: 30,
    })
    @Unique()
    @Length(5, 30)
    username!: string

    @Property({
        length: 255,
    })
    @Length(3, 255)
    fullName!: string

    @Property({
        length: 50,
    })
    @Unique()
    @Length(5, 50)
    @IsEmail()
    email!: string

    @Property({
        length: 60,
    })
    password!: string

    @Property()
    isActive!: boolean

    @Enum({
        items: () => UserRole,
    })
    @IsEnum(UserRole)
    role!: UserRole

    stripUser() {
        delete this.createdAt
        delete this.updatedAt
        delete this.fullName
        delete this.email
        delete this.password
        delete this.isActive
        return this
    }
}
