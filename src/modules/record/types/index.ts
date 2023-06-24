import { Category } from '../../../database/enums'
import Record from '../../../database/entities/Record'

export type RecordData = {
    amount: number
    date: Date
    category: Category
    isExpense: boolean
    accountId: number
    description?: string
}

export type PaginatedData = {
    items: Record[]
    pageCount: number
}
