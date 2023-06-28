import { Category, RecordType } from '../../../database/enums'
import Record from '../../../database/entities/Record'

export type RecordData = {
    recordType: RecordType
    accountId: number
    toAccountId: number
    amount: number
    date: Date
    category: Category
    isExpense: boolean
    description?: string
}

export type PaginatedData = {
    items: Record[]
    pageCount: number
}
