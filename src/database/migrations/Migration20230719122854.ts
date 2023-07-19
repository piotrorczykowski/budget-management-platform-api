import { Migration } from '@mikro-orm/migrations'

export class Migration20230719122854 extends Migration {
    async up(): Promise<void> {
        this.addSql(
            "alter table `record` modify `amount` numeric(10,2) not null default 0, modify `category` enum('Food', 'Shopping', 'Housing', 'Transportation', 'Vehicle', 'Entertainment', 'Communication', 'Financial Expenses', 'Income', 'Transfer', 'Other') not null default 'Other';"
        )
    }

    async down(): Promise<void> {
        this.addSql(
            "alter table `record` modify `amount` decimal(10,2) not null default 0.00, modify `category` enum('Food', 'Shopping', 'Housing', 'Transportation', 'Vehicle', 'Entertainment', 'Communication', 'Financial Expenses', 'Income', 'Other') not null default 'Other';"
        )
    }
}
