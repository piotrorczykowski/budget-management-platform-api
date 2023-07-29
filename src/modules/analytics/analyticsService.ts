import { EntityRepository } from '@mikro-orm/core'
import Record from '../../database/entities/Record'
import _ from 'lodash'
import moment from 'moment'
import { AccountBalanceInfoTyp as AccountBalanceInfoType, CashFlowType, ExpensesStructureType } from './types'
import Account from '../../database/entities/Account'
import HistoricalAccountBalance from '../../database/entities/HistoricalAccountBalance'
import { getDaysArrayForGivenMonth } from '../../utils/dateUtils'

export default class AnalyticsService {
    recordRepository: EntityRepository<Record>
    accountRepository: EntityRepository<Account>
    historicalAccountBalanceRepository: EntityRepository<HistoricalAccountBalance>

    constructor({
        recordRepository,
        accountRepository,
        historicalAccountBalanceRepository,
    }: {
        recordRepository: EntityRepository<Record>
        accountRepository: EntityRepository<Account>
        historicalAccountBalanceRepository: EntityRepository<HistoricalAccountBalance>
    }) {
        this.recordRepository = recordRepository
        this.accountRepository = accountRepository
        this.historicalAccountBalanceRepository = historicalAccountBalanceRepository
    }

    public async getCashFlow(userId: number, monthForInfo: Date): Promise<CashFlowType> {
        const startOfMonth: Date = moment(monthForInfo).startOf('month').toDate()
        const endOfMonth: Date = moment(monthForInfo).endOf('month').toDate()

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

    public async getExpensesStructure(userId: number, monthForInfo: Date): Promise<ExpensesStructureType> {
        const startOfMonth: Date = moment(monthForInfo).startOf('month').toDate()
        const endOfMonth: Date = moment(monthForInfo).endOf('month').toDate()

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

        const groupedExpenses: _.Dictionary<Record[]> = _.groupBy(expenses, 'category')

        const expensesStructure: ExpensesStructureType = []

        _.forEach(groupedExpenses, function (value, key) {
            const expensesSum: number = _.sumBy(value, (v) => Number(v.amount))
            expensesStructure.push({ title: key, value: expensesSum })
        })

        return expensesStructure
    }

    public async saveHistoricalAccountBalance(): Promise<void> {
        const accounts: Account[] = await this.accountRepository.find(
            {},
            {
                populate: ['historicalAccountBalances'],
            }
        )

        const historicalAccountBalances: HistoricalAccountBalance[] = []

        for (const account of accounts) {
            const historicalBalance: HistoricalAccountBalance = Array.from(account.historicalAccountBalances)?.find(
                (historicalBalance) =>
                    moment(historicalBalance.date).utc().isSame(moment().subtract(1, 'month').endOf('month'), 'month')
            )
            const historicalBalanceAlreadyExists: boolean = !!historicalBalance

            if (historicalBalanceAlreadyExists) {
                historicalBalance.balance = account.balance
                historicalAccountBalances.push(historicalBalance)
            } else {
                const historicalAccountBalance: HistoricalAccountBalance = new HistoricalAccountBalance()

                historicalAccountBalance.balance = account.balance
                historicalAccountBalance.date = moment().subtract(1, 'month').endOf('month').toDate()
                historicalAccountBalance.account = account

                historicalAccountBalances.push(historicalAccountBalance)
            }
        }

        await this.historicalAccountBalanceRepository.persistAndFlush(historicalAccountBalances)
    }

    public async getAccountBalanceTrend(accountId: number, monthForInfo: Date): Promise<AccountBalanceInfoType> {
        const account: Account = await this.accountRepository.findOneOrFail(
            { id: accountId },
            {
                populate: ['historicalAccountBalances', 'records'],
            }
        )

        const historicalBalance: HistoricalAccountBalance = Array.from(account.historicalAccountBalances)?.find(
            (historicalBalance) =>
                moment(historicalBalance.date).utc().isSame(moment().subtract(0, 'month').endOf('month'), 'month')
        )

        const balanceInfoArray: AccountBalanceInfoType = []

        const historicalBalanceExists: boolean = !!historicalBalance

        let balance: number = historicalBalanceExists ? Number(historicalBalance.balance) : Number(account.balance)
        const daysArray: Date[] = historicalBalanceExists
            ? getDaysArrayForGivenMonth(monthForInfo).reverse()
            : getDaysArrayForGivenMonth(monthForInfo)
                  .reverse()
                  .filter((day) => moment(day).utc().isSameOrBefore(moment().utc(), 'day'))

        for (const day of daysArray) {
            balance = await this.recalculateBalanceForGivenDateAndAccount(balance, day, account)

            const balanceInfo: [Date, number] = [day, balance]
            balanceInfoArray.push(balanceInfo)
        }

        return balanceInfoArray.reverse()
    }

    private async recalculateBalanceForGivenDateAndAccount(
        balance: number,
        day: Date,
        account: Account
    ): Promise<number> {
        const records: Record[] = Array.from(account.records).filter((record) =>
            moment(record.date).utc().subtract(1, 'day').isSame(moment(day).utc(), 'day')
        )

        for (const record of records) {
            const isRecordExpense: boolean = record.isExpense

            if (isRecordExpense) {
                balance = Number(balance) + Number(record.amount)
            } else {
                balance = Number(balance) - Number(record.amount)
            }
        }

        return balance
    }

    public async getAccountsBalanceTrend(userId: number, monthForInfo: Date): Promise<AccountBalanceInfoType> {
        const accounts: Account[] = await this.accountRepository.find({
            user: {
                id: userId,
            },
        })

        const accountsBalance: [Date, number][][] = []
        for (const account of accounts) {
            const accountBalance: [Date, number][] = await this.getAccountBalanceTrend(account.id, monthForInfo)
            accountsBalance.push(accountBalance)
        }

        const infoDisplayedForCurrentMonth: boolean = moment().utc().isSame(moment(monthForInfo).utc(), 'month')

        const formattedAccountsBalance: [Date, number][] = infoDisplayedForCurrentMonth
            ? getDaysArrayForGivenMonth(monthForInfo)
                  .filter((day) => moment(day).utc().isSameOrBefore(moment().utc(), 'day'))
                  .map((date) => [date, 0])
            : getDaysArrayForGivenMonth(monthForInfo).map((date) => [date, 0])

        for (const accountBalance of accountsBalance) {
            for (const dayIndex in accountBalance) {
                formattedAccountsBalance[dayIndex][1] =
                    Number(formattedAccountsBalance[dayIndex][1]) + Number(accountBalance[dayIndex][1])
            }
        }

        return formattedAccountsBalance
    }
}
