import { EntityRepository } from '@mikro-orm/mysql'
import Budget from '../../database/entities/Budget'
import { BudgetData } from './types'
import User from '../../database/entities/User'
import moment from 'moment'

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
}
