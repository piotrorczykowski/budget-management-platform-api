import { Category } from '../../../database/enums'

export type BudgetData = {
    name: string
    planned: number
    startDate: Date
    endDate: Date
    categories: Category[]
}
