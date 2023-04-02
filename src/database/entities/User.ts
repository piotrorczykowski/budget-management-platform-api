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
        length: 50,
    })
    @Length(3, 50)
    firstName!: string

    @Property({
        length: 80,
    })
    @Length(3, 80)
    lastName!: string

    @Property({
        length: 50,
    })
    @Unique()
    @Length(5, 50)
    @IsEmail()
    email!: string

    @Property({
        length: 50,
    })
    @Length(5, 50)
    password!: string

    @Enum({
        items: () => UserRole,
    })
    @IsEnum(UserRole)
    role!: UserRole
}
