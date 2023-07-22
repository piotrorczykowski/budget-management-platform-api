import { EntityRepository } from '@mikro-orm/core'
import Record from '../../database/entities/Record'
import _ from 'lodash'
import moment from 'moment'
import { CashFlowType } from './types'

export default class AnalyticsService {
    recordRepository: EntityRepository<Record>

    constructor({ recordRepository }: { recordRepository: EntityRepository<Record> }) {
        this.recordRepository = recordRepository
    }

    public async getCashFlow(userId, dateForCashFlowInfo: Date): Promise<CashFlowType> {
        const startOfMonth: Date = moment(dateForCashFlowInfo).startOf('month').toDate()
        const endOfMonth: Date = moment(dateForCashFlowInfo).endOf('month').toDate()

        const incomes: Record[] = await this.recordRepository.find({
            isExpense: false,
            isTransfer: false,
            date: {
                $gte: startOfMonth,
                $lte: endOfMonth,
            },
            account: {
                user: {
                    id: userId,
                },
            },
        })

        const incomesSum: number = _.sumBy(incomes, (income) => Number(income.amount))

        const expenses: Record[] = await this.recordRepository.find({
            isExpense: true,
            isTransfer: false,
            date: {
                $gte: startOfMonth,
                $lte: endOfMonth,
            },
            account: {
                user: {
                    id: userId,
                },
            },
        })

        const expensesSum: number = _.sumBy(expenses, (expense) => Number(expense.amount))

        return {
            income: Number(incomesSum.toFixed(2)),
            expenses: Number(expensesSum.toFixed(2)),
        }
    }
}
