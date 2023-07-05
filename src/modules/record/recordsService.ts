import { EntityRepository } from '@mikro-orm/mysql'
import Record from '../../database/entities/Record'
import { FetchRecordsData, PaginatedData, RecordData } from './types'
import Account from '../../database/entities/Account'
import moment from 'moment'
import { QueryOrder } from '@mikro-orm/core'
import { Category, RecordType, SortingOptions } from '../../database/enums'
import { CategoryNameToSkipInFilter } from './types/constants'

export default class RecordsService {
    recordRepository: EntityRepository<Record>
    accountRepository: EntityRepository<Account>

    constructor({
        recordRepository,
        accountRepository,
    }: {
        recordRepository: EntityRepository<Record>
        accountRepository: EntityRepository<Account>
    }) {
        this.recordRepository = recordRepository
        this.accountRepository = accountRepository
    }

    public async handleRecordCreation(recordData: RecordData): Promise<Record | Record[]> {
        const recordType: RecordType = recordData.recordType
        recordType === RecordType.Transfer ? (recordData.isTransfer = true) : (recordData.isTransfer = false)

        switch (recordType) {
            case RecordType.Expense:
                return await this.createRecord({ ...recordData, isExpense: true })
            case RecordType.Income:
                return await this.createRecord({ ...recordData, isExpense: false })
            case RecordType.Transfer:
                return await this.createTransferRecord(recordData)
        }
    }

    public async createRecord(recordData: RecordData): Promise<Record> {
        const account: Account = await this.accountRepository.findOneOrFail({ id: recordData.accountId })

        const record: Record = new Record()
        record.amount = recordData.amount
        record.date = moment(recordData.date).utc().toDate()
        record.isExpense = recordData.isExpense
        record.category = recordData.category
        record.description = recordData.description
        record.isTransfer = <boolean>recordData.isTransfer
        record.account = this.updateAccountBalance(account, record)

        await this.recordRepository.persistAndFlush(record)
        return record
    }

    private updateAccountBalance(account: Account, record: Record): Account {
        if (record.isExpense) {
            account.balance = Number(account.balance) - Number(record.amount)
        } else {
            account.balance = Number(account.balance) + Number(record.amount)
        }

        return account
    }

    public async createTransferRecord(recordData: RecordData): Promise<Record[]> {
        const transferRecordFrom: Record = await this.createRecord({
            ...recordData,
            isExpense: true,
            category: Category.FinancialExpenses,
        })
        const transferRecordTo: Record = await this.createRecord({
            ...recordData,
            isExpense: false,
            accountId: recordData.toAccountId,
            category: Category.FinancialExpenses,
        })

        return [transferRecordFrom, transferRecordTo]
    }

    public async getPaginatedRecordsForUser({
        userId,
        page,
        pageSize,
        sortingOptions,
        accountId,
        searchByValue,
        recordType,
        category,
    }: FetchRecordsData): Promise<PaginatedData> {
        const skipCount: number = (page - 1) * pageSize
        const orderBy: any = this.getOrderBy(sortingOptions)
        const searchBy: any = this.getSearchBy(userId, accountId, searchByValue, recordType, category)

        const records: Record[] = (
            await this.recordRepository.find(searchBy, {
                orderBy: orderBy,
                offset: skipCount,
                limit: pageSize,
                populate: ['account'],
            })
        )?.map((record) => {
            const accountName: string = record.account?.name
            delete record['account']
            return { ...record, accountName: accountName }
        })

        const recordsCount: number = await this.recordRepository.count(searchBy)
        const pageCount: number = Math.ceil(recordsCount / pageSize)

        return {
            items: records,
            pageCount: pageCount,
        }
    }

    private getOrderBy(sortingOptions: string): any {
        switch (sortingOptions) {
            case SortingOptions.AmountAsc:
                return { amount: QueryOrder.ASC }
            case SortingOptions.DateAsc:
                return { date: QueryOrder.ASC }
            case SortingOptions.AmountDesc:
                return { amount: QueryOrder.DESC }
            case SortingOptions.DateDesc:
            default:
                return { date: QueryOrder.DESC }
        }
    }

    private getSearchBy(
        userId: number,
        accountId: number,
        searchByValue: string,
        recordType: string,
        category: string
    ): any {
        let searchBy: any

        if (accountId) {
            searchBy = { account: { id: accountId, user: { id: userId } } }
        } else {
            searchBy = {
                account: {
                    user: {
                        id: userId,
                    },
                },
            }
        }

        if (searchByValue.length) {
            searchBy = { ...searchBy, description: { $like: `%${searchByValue}%` } }
        }

        if (recordType.length) {
            switch (recordType) {
                case RecordType.Expense:
                    searchBy = { ...searchBy, isExpense: true, isTransfer: false }
                    break
                case RecordType.Income:
                    searchBy = { ...searchBy, isExpense: false, isTransfer: false }
                    break
                case RecordType.Transfer:
                    searchBy = { ...searchBy, isTransfer: true }
                    break
            }
        }

        if (category != CategoryNameToSkipInFilter) {
            searchBy = { ...searchBy, category: Category[category] }
        }

        return searchBy
    }
}
