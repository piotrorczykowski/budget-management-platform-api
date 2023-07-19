export enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER',
}

export enum Currency {
    PLN = 'PLN',
    EUR = 'EUR',
    USD = 'USD',
    GBP = 'GBP',
}

export enum Category {
    Food = 'Food',
    Shopping = 'Shopping',
    Housing = 'Housing',
    Transportation = 'Transportation',
    Vehicle = 'Vehicle',
    Entertainment = 'Entertainment',
    Communication = 'Communication',
    FinancialExpenses = 'Financial Expenses',
    Income = 'Income',
    Transfer = 'Transfer',
    Other = 'Other',
}

export enum RecordType {
    Expense = 'Expense',
    Income = 'Income',
    Transfer = 'Transfer',
}

export enum SortingOptions {
    DateAsc = 'Date (old to new)',
    DateDesc = 'Date (new to old)',
    AmountAsc = 'Amount (lower to higher)',
    AmountDesc = 'Amount (higher to lower)',
}
