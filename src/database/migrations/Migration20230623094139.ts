import { Migration } from '@mikro-orm/migrations'

export class Migration20230623094139 extends Migration {
    async up(): Promise<void> {
        this.addSql("alter table `user` add `currency` enum('PLN', 'EUR', 'USD', 'GBP') not null;")
    }

    async down(): Promise<void> {
        this.addSql('alter table `user` drop `currency`;')
    }
}
