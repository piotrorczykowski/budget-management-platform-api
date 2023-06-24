import { EntityRepository } from '@mikro-orm/mysql'
import Record from '../../database/entities/Record'
import { PaginatedData, RecordData } from './types'
import Account from '../../database/entities/Account'
import moment from 'moment'
import { QueryOrder } from '@mikro-orm/core'

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

    public async createRecord(recordData: RecordData): Promise<Record> {
        const account: Account = await this.accountRepository.findOneOrFail({ id: recordData.accountId })

        const record: Record = new Record()
        record.amount = recordData.amount
        record.date = moment(recordData.date).utc().toDate()
        record.isExpense = recordData.isExpense
        record.description = recordData.description
        record.account = account

        await this.recordRepository.persistAndFlush(record)
        return record
    }

    public async getPaginatedRecordsForUser(userId: number, page: number, pageSize: number): Promise<PaginatedData> {
        const skipCount: number = (page - 1) * pageSize

        const records: Record[] = await this.recordRepository.find(
            { account: { user: { id: userId } } },
            {
                orderBy: { date: QueryOrder.DESC },
                offset: skipCount,
                limit: pageSize,
            }
        )

        const recordsCount: number = await this.recordRepository.count({ account: { user: { id: userId } } })
        const pageCount: number = Math.ceil(recordsCount / pageSize)

        return {
            items: records,
            pageCount: pageCount,
        }
    }
}
