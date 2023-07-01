import { EntityRepository } from '@mikro-orm/mysql'
import Record from '../../database/entities/Record'
import { PaginatedData, RecordData } from './types'
import Account from '../../database/entities/Account'
import moment from 'moment'
import { QueryOrder } from '@mikro-orm/core'
import { Category, RecordType } from '../../database/enums'

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

    public async getPaginatedRecordsForUser(userId: number, page: number, pageSize: number): Promise<PaginatedData> {
        const skipCount: number = (page - 1) * pageSize

        const records: Record[] = (
            await this.recordRepository.find(
                { account: { user: { id: userId } } },
                {
                    orderBy: { date: QueryOrder.DESC },
                    offset: skipCount,
                    limit: pageSize,
                    populate: ['account'],
                }
            )
        )?.map((record) => {
            const accountName: string = record.account?.name
            delete record['account']
            return { ...record, accountName: accountName }
        })

        const recordsCount: number = await this.recordRepository.count({ account: { user: { id: userId } } })
        const pageCount: number = Math.ceil(recordsCount / pageSize)

        return {
            items: records,
            pageCount: pageCount,
        }
    }
}
