import { EntityRepository } from '@mikro-orm/mysql'
import Account from '../../database/entities/Account'
import { AccountData } from './types'
import User from '../../database/entities/User'
import RecordsService from '../record/recordsService'

export default class AccountsService {
    accountRepository: EntityRepository<Account>
    userRepository: EntityRepository<User>
    recordsService: RecordsService

    constructor({
        accountRepository,
        userRepository,
        recordsService,
    }: {
        accountRepository: EntityRepository<Account>
        userRepository: EntityRepository<User>
        recordsService: RecordsService
    }) {
        this.accountRepository = accountRepository
        this.userRepository = userRepository
        this.recordsService = recordsService
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

    public async updateAccount(accountId: number, accountData: AccountData): Promise<Account> {
        const account: Account = await this.accountRepository.findOneOrFail({ id: accountId })

        const shouldCreateNewRecord: boolean = account.balance !== accountData.balance
        if (shouldCreateNewRecord) {
            await this.recordsService.createInternalRecord(accountId, accountData.balance)
        }

        account.name = accountData.name
        account.balance = accountData.balance

        await this.accountRepository.persistAndFlush(account)
        return account
    }

    public async deleteAccount(accountId: number): Promise<void> {
        const account: Account = await this.accountRepository.findOneOrFail({ id: accountId })
        await this.softDeleteAccount(account)
    }

    private async softDeleteAccount(account: Account): Promise<void> {
        account.deletedAt = new Date()
        await this.accountRepository.persistAndFlush(account)
    }

    private async validateUserAccountsNumber(userId: number): Promise<void> {
        const userAccountNumber: number = await this.accountRepository.count({ user: { id: userId } })

        if (userAccountNumber >= 5) {
            throw new Error(`Cannot create account for user with id: ${userId}. Maximum accounts number reached`)
        }
    }

    public async getUserAccounts(userId: number, searchByValue: string): Promise<Account[]> {
        const accounts: Account[] = await this.accountRepository.find({
            user: { id: userId },
            name: { $like: `%${searchByValue}%` },
        })
        return accounts
    }
}
