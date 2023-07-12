import { Category, RecordType } from '../../../database/enums'
import Record from '../../../database/entities/Record'

export type RecordData = {
    recordType: RecordType
    accountId: number
    amount: number
    date: Date
    category: Category
    isExpense: boolean
    toAccountId?: number
    isTransfer?: boolean
    description?: string
}

export type PaginatedData = {
    items: Record[]
    pageCount: number
}

export type FetchRecordsData = {
    userId: number
    page: number
    pageSize: number
    sortingOptions: string
    accountId: number
    searchByValue: string
    recordType: string
    category: string
}
