export type CashFlowType = {
    income: number
    expenses: number
}

type PieChartEntryType = {
    title: string
    value: number
}

export type ExpensesStructureType = PieChartEntryType[]

export type AccountBalanceInfoTyp = [Date, number][]
