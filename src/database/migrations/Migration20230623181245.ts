import { Migration } from '@mikro-orm/migrations'

export class Migration20230623181245 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table `account` modify `balance` numeric(10,2) not null default 0;')
    }

    async down(): Promise<void> {
        this.addSql('alter table `account` modify `balance` int not null;')
    }
}
