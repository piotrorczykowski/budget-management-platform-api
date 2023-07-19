import { EntityRepository } from '@mikro-orm/mysql'
import Record from '../../database/entities/Record'
import { FetchRecordsData, PaginatedData, RecordData } from './types'
import Account from '../../database/entities/Account'
import moment from 'moment'
import { QueryOrder } from '@mikro-orm/core'
import { Category, RecordType, SortingOptions } from '../../database/enums'
import { CategoryNameToSkipInFilter } from './types/constants'
import { camelCase, startCase } from 'lodash'
import logger from '../../winston'
import BudgetRecordsService from '../budget/budgetRecordsService'

export default class RecordsService {
    recordRepository: EntityRepository<Record>
    accountRepository: EntityRepository<Account>
    budgetRecordsService: BudgetRecordsService

    constructor({
        recordRepository,
        accountRepository,
        budgetRecordsService,
    }: {
        recordRepository: EntityRepository<Record>
        accountRepository: EntityRepository<Account>
        budgetRecordsService: BudgetRecordsService
    }) {
        this.recordRepository = recordRepository
        this.accountRepository = accountRepository
        this.budgetRecordsService = budgetRecordsService
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

    private async createRecord(recordData: RecordData): Promise<Record> {
        const account: Account = await this.accountRepository.findOneOrFail({ id: recordData.accountId })

        const record: Record = new Record()
        record.amount = Number(recordData.amount)
        record.date = moment(recordData.date).utc().toDate()
        record.isExpense = recordData.isExpense
        record.category = recordData.category
        record.description = recordData.description || ''
        record.isTransfer = <boolean>recordData.isTransfer
        record.account = this.updateAccountBalance(account, record)

        const amountChange: number = Number(record.amount)
        await this.budgetRecordsService.handleRecordManagement(record, amountChange)

        await this.recordRepository.persistAndFlush(record)
        return record
    }

    private updateAccountBalance(account: Account, record: Record, removingRecord: boolean = false): Account {
        if (record.isExpense) {
            account.balance = removingRecord
                ? Number(account.balance) + Number(record.amount)
                : Number(account.balance) - Number(record.amount)
        } else {
            account.balance = removingRecord
                ? Number(account.balance) - Number(record.amount)
                : Number(account.balance) + Number(record.amount)
        }

        return account
    }

    private async createTransferRecord(recordData: RecordData): Promise<Record[]> {
        const transferRecordFrom: Record = await this.createRecord({
            ...recordData,
            isExpense: true,
        })
        const transferRecordTo: Record = await this.createRecord({
            ...recordData,
            isExpense: false,
            accountId: recordData.toAccountId,
        })

        return [transferRecordFrom, transferRecordTo]
    }

    public async handleRecordUpdate(recordId: number, recordData: RecordData): Promise<Record | Record[]> {
        const recordType: RecordType = recordData.recordType
        recordType === RecordType.Transfer ? (recordData.isTransfer = true) : (recordData.isTransfer = false)

        const isRecordTransfer: boolean = recordData.isTransfer

        if (isRecordTransfer) {
            return await this.handleTransferRecordUpdate(recordId, recordData)
        } else {
            return await this.updateRecord(recordId, recordData)
        }
    }

    private async handleTransferRecordUpdate(recordId: number, recordData: RecordData): Promise<Record[]> {
        const updatingRecord: Record = await this.recordRepository.findOneOrFail({ id: recordId })
        await this.deleteTransferRecord(updatingRecord)
        return await this.createTransferRecord({ ...recordData })
    }

    public async updateRecord(recordId: number, recordData: RecordData): Promise<Record> {
        logger.info('Updating normal record...')
        const record: Record = await this.recordRepository.findOneOrFail(
            { id: recordId },
            {
                filters: {
                    softDelete: {
                        getAll: true,
                    },
                },
                populate: ['account'],
            }
        )

        this.updateAccountBalance(record.account, record, true)

        const amountChange: number = Number(recordData.amount) - Number(record.amount)
        await this.budgetRecordsService.handleRecordManagement(record, amountChange)

        record.amount = Number(recordData.amount)
        record.date = moment(recordData.date).utc().toDate()
        record.category = recordData.category
        record.description = recordData.description || ''

        const account: Account = await this.accountRepository.findOneOrFail({ id: recordData.accountId })
        record.account = this.updateAccountBalance(account, record)

        await this.recordRepository.persistAndFlush(record)
        return record
    }

    public async handleRecordDelete(recordId: number): Promise<void> {
        const record: Record = await this.recordRepository.findOneOrFail({ id: recordId })
        const isRecordTransfer: boolean = record.isTransfer

        if (isRecordTransfer) {
            await this.deleteTransferRecord(record)
        } else {
            await this.deleteNormalRecord(record)
        }
    }

    private async deleteTransferRecord(record: Record): Promise<void> {
        const isRecordExpense: boolean = record.isExpense
        const correspondingRecord: Record = await this.recordRepository.findOne({
            isTransfer: true,
            date: record.date,
            isExpense: !isRecordExpense,
        })

        await this.handleDeletedRecordAccountBalance(record)
        await this.handleDeletedRecordAccountBalance(correspondingRecord)

        await this.recordRepository.removeAndFlush(record)
        await this.recordRepository.removeAndFlush(correspondingRecord)
    }

    private async deleteNormalRecord(record: Record): Promise<void> {
        await this.handleDeletedRecordAccountBalance(record)
        await this.recordRepository.removeAndFlush(record)
    }

    private async handleDeletedRecordAccountBalance(record: Record): Promise<void> {
        const account: Account = await this.accountRepository.findOne(
            { id: record.account.id },
            {
                filters: {
                    softDelete: {
                        getAll: true,
                    },
                },
            }
        )

        const amountChange: number = -1 * Number(record.amount)
        await this.budgetRecordsService.handleRecordManagement(record, amountChange)

        await this.updateAccountBalance(account, record, true)
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

        const records: Record[] = await this.recordRepository.find(searchBy, {
            orderBy: orderBy,
            offset: skipCount,
            limit: pageSize,
            populate: ['account'],
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
                return { amount: QueryOrder.ASC, isExpense: QueryOrder.ASC }
            case SortingOptions.DateAsc:
                return { date: QueryOrder.ASC, isExpense: QueryOrder.ASC }
            case SortingOptions.AmountDesc:
                return { amount: QueryOrder.DESC, isExpense: QueryOrder.ASC }
            case SortingOptions.DateDesc:
            default:
                return { date: QueryOrder.DESC, isExpense: QueryOrder.ASC }
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
            const categoryName: string = startCase(camelCase(category)).replace(/ /g, '')
            searchBy = { ...searchBy, category: Category[categoryName] }
        }

        return searchBy
    }

    public async createInternalRecord(accountId: number, accountBalance: number): Promise<void> {
        const account: Account = await this.accountRepository.findOneOrFail({ id: accountId })

        const recordType: RecordType = Number(account.balance) > accountBalance ? RecordType.Expense : RecordType.Income
        const amount: number = Math.abs(Number(account.balance) - accountBalance)
        const category: Category = recordType === RecordType.Expense ? Category.FinancialExpenses : Category.Income
        const isExpense: boolean = recordType === RecordType.Expense

        await this.createRecord({
            recordType,
            accountId,
            amount,
            date: new Date(),
            category,
            isExpense,
        })
    }
}
