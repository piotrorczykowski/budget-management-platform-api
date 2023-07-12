import { Migration } from '@mikro-orm/migrations'

export class Migration20230712130348 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table `account` add `deleted_at` varchar(255) null;')
        this.addSql('alter table `account` modify `balance` numeric(10,2) not null default 0;')
        this.addSql('alter table `account` add index `account_deleted_at_index`(`deleted_at`);')

        this.addSql('alter table `record` modify `amount` numeric(10,2) not null default 0;')
    }

    async down(): Promise<void> {
        this.addSql('alter table `account` modify `balance` decimal(10,2) not null default 0.00;')
        this.addSql('alter table `account` drop index `account_deleted_at_index`;')
        this.addSql('alter table `account` drop `deleted_at`;')

        this.addSql('alter table `record` modify `amount` decimal(10,2) not null default 0.00;')
    }
}
