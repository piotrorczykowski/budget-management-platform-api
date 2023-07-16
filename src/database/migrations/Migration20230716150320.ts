import { Migration } from '@mikro-orm/migrations'

export class Migration20230716150320 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table `budget` drop index `budget_name_unique`;')
    }

    async down(): Promise<void> {
        this.addSql('alter table `budget` add unique `budget_name_unique`(`name`);')
    }
}
