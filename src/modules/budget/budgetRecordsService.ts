import Budget from '../../database/entities/Budget'
import { Category } from '../../database/enums'
import Record from '../../database/entities/Record'
import _ from 'lodash'
import { EntityRepository } from '@mikro-orm/core'

export default class BudgetRecordsService {
    budgetRepository: EntityRepository<Budget>
    recordRepository: EntityRepository<Record>

    constructor({
        budgetRepository,
        recordRepository,
    }: {
        budgetRepository: EntityRepository<Budget>
        recordRepository: EntityRepository<Record>
    }) {
        this.budgetRepository = budgetRepository
        this.recordRepository = recordRepository
    }

    public async updateBudgetProgress(budget: Budget): Promise<Budget> {
        const userId: number = budget.user.id
        const budgetStartDate: Date = budget.startDate
        const budgetEndDate: Date = budget.endDate
        const categories: Category[] = budget.categories

        const userRecordsForBudget: Record[] = await this.getUserRecordsForBudget(
            userId,
            budgetStartDate,
            budgetEndDate,
            categories
        )

        const sumOfUserRecordsForBudget: number = userRecordsForBudget.length
            ? _.sumBy(userRecordsForBudget, (record) => record.amount)
            : 0

        budget.spent = sumOfUserRecordsForBudget
        return budget
    }

    private async getUserRecordsForBudget(
        userId: number,
        startDate: Date,
        endDate: Date,
        categories: Category[]
    ): Promise<Record[]> {
        const records: Record[] = await this.recordRepository.find({
            account: {
                user: {
                    id: userId,
                },
            },
            date: {
                $gte: startDate,
                $lte: endDate,
            },
            category: { $in: categories },
            isTransfer: false,
        })

        return records
    }

    public async handleRecordManagement(record: Record, amountChange: number): Promise<void> {
        const date: Date = record.date
        const category: Category = record.category
        const budgets: Budget[] = await this.getBudgetsForRecord(date, category)

        for (const budget of budgets) {
            budget.spent = Number(budget.spent) + amountChange
        }

        await this.budgetRepository.persistAndFlush(budgets)
    }

    public async getBudgetsForRecord(date: Date, category: Category): Promise<Budget[]> {
        const budgets: Budget[] = await this.budgetRepository.find({
            startDate: {
                $lte: date,
            },
            endDate: {
                $gte: date,
            },
            categories: {
                $like: `%${category}%`,
            },
        })
        return budgets
    }
}
