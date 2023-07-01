import { Migration } from '@mikro-orm/migrations'

export class Migration20230701135259 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table `record` add `is_transfer` tinyint(1) not null default false;')
    }

    async down(): Promise<void> {
        this.addSql('alter table `record` drop `is_transfer`;')
    }
}
