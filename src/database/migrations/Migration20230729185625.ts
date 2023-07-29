import { Migration } from '@mikro-orm/migrations'

export class Migration20230729185625 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table `account` drop index `account_name_unique`;')
    }

    async down(): Promise<void> {
        this.addSql('alter table `account` add unique `account_name_unique`(`name`);')
    }
}
