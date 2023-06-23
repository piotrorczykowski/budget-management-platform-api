import { EntityRepository } from '@mikro-orm/mysql'
import Account from '../../database/entities/Account'
import { AccountData } from './types'
import User from '../../database/entities/User'

export default class AccountsService {
    accountRepository: EntityRepository<Account>
    userRepository: EntityRepository<User>

    constructor({
        accountRepository,
        userRepository,
    }: {
        accountRepository: EntityRepository<Account>
        userRepository: EntityRepository<User>
    }) {
        this.accountRepository = accountRepository
        this.userRepository = userRepository
    }

    public async createAccount(accountData: AccountData, userId: number): Promise<Account> {
        await this.validateUserAccountsNumber(userId)

        const user: User = await this.userRepository.findOneOrFail({ id: userId })

        const account: Account = new Account()
        account.name = accountData.name
        account.balance = accountData.balance
        account.user = user

        return await this.accountRepository.upsert(account)
    }

    private async validateUserAccountsNumber(userId: number): Promise<void> {
        const userAccountNumber: number = await this.accountRepository.count({ user: { id: userId } })

        if (userAccountNumber >= 5) {
            throw new Error(`Cannot create account for user with id: ${userId}. Maximum accounts number reached`)
        }
    }
}
