import { EntityRepository } from '@mikro-orm/mysql'
import Budget from '../../database/entities/Budget'
import { BudgetData } from './types'
import User from '../../database/entities/User'
import moment from 'moment'
import { PaginatedData } from './types'
import { QueryOrder } from '@mikro-orm/core'

export default class BudgetsService {
    budgetRepository: EntityRepository<Budget>

    constructor({ budgetRepository }: { budgetRepository: EntityRepository<Budget> }) {
        this.budgetRepository = budgetRepository
    }

    public async createBudget(user: User, budgetData: BudgetData): Promise<Budget> {
        const budget: Budget = new Budget()
        budget.name = budgetData.name
        budget.planned = budgetData.planned
        budget.startDate = moment(budgetData.startDate).utc().toDate()
        budget.endDate = moment(budgetData.endDate).utc().toDate()
        budget.categories = budgetData.categories
        budget.user = user

        await this.budgetRepository.persistAndFlush(budget)
        return budget
    }

    public async getUserBudgets({
        userId,
        page,
        pageSize,
        searchByValue,
    }: {
        userId: number
        page: number
        pageSize: number
        searchByValue: string
    }): Promise<PaginatedData> {
        const skipCount: number = (page - 1) * pageSize

        const budgets: Budget[] = await this.budgetRepository.find(
            {
                name: { $like: `%${searchByValue}%` },
                user: { id: userId },
            },
            {
                orderBy: {
                    endDate: QueryOrder.DESC,
                },
                offset: skipCount,
                limit: pageSize,
            }
        )

        const budgetsCount: number = await this.budgetRepository.count({
            name: { $like: `%${searchByValue}%` },
        })
        const pageCount: number = Math.ceil(budgetsCount / pageSize)

        return {
            items: budgets,
            pageCount: pageCount,
        }
    }
}
