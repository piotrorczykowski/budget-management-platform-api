import { EntityRepository } from '@mikro-orm/mysql'
import { UserRole } from '../database/enums'
import Account from '../database/entities/Account'
import { getContainer } from '../server'
import { AwilixContainer } from 'awilix'
import User from '../database/entities/User'

class AccountCheck {
    ctx: any
    accountRepository: EntityRepository<Account>

    constructor({ ctx, accountRepository }: { ctx: any; accountRepository: EntityRepository<Account> }) {
        this.ctx = ctx
        this.accountRepository = accountRepository
    }

    async getUserAccountIds(userId: number): Promise<number[]> {
        const userAccountIds: number[] = (await this.accountRepository.find({ user: { id: userId } }))?.map(
            (account) => account.id
        )
        return userAccountIds
    }

    async checkUserToAccountAssociation(next: () => Promise<any>) {
        const reqUser: User = this.ctx.state.user
        if (reqUser.role === UserRole.ADMIN) {
            return await next()
        }

        const accountId: number = Number(this.ctx.params.accountId)
        const userAccountIds: number[] = await this.getUserAccountIds(reqUser.id)
        const isAccountAssociatedWithUser: boolean = userAccountIds.includes(accountId)
        if (isAccountAssociatedWithUser) {
            return await next()
        }

        this.ctx.status = 403
        return
    }
}

const accountCheckMiddleware = (ctx, next) => {
    const container: AwilixContainer = getContainer()
    const accountRepository: EntityRepository<Account> = container.resolve('accountRepository')
    const checker: AccountCheck = new AccountCheck({
        ctx,
        accountRepository,
    })

    return checker.checkUserToAccountAssociation(next)
}

export default accountCheckMiddleware
