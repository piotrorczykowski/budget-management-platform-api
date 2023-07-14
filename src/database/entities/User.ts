import { Cascade, Collection, Entity, Enum, OneToMany, Property, Unique } from '@mikro-orm/core'
import CustomBaseEntity from './CustomBaseEntity'
import { IsEmail, IsEnum, Length } from 'class-validator'
import { Currency, UserRole } from '../enums'
import Account from './Account'
import Budget from './Budget'

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

    @Enum({
        items: () => Currency,
    })
    @IsEnum(Currency)
    currency: Currency = Currency.PLN

    @OneToMany(() => Account, (account) => account.user, { cascade: [Cascade.REMOVE] })
    accounts = new Collection<Account>(this)

    @OneToMany(() => Budget, (budget) => budget.user, { cascade: [Cascade.REMOVE] })
    budgets = new Collection<Budget>(this)

    stripUser() {
        delete this.createdAt
        delete this.updatedAt
        delete this.isActive
        delete this.password
        return this
    }
}
