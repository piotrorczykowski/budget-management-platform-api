import { Migration } from '@mikro-orm/migrations'

export class Migration20230527115522 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table `user` drop `last_name`;')
        this.addSql('alter table `user` change `first_name` `full_name` varchar(255) not null;')
    }

    async down(): Promise<void> {
        this.addSql('alter table `user` add `last_name` varchar(80) not null;')
        this.addSql('alter table `user` change `full_name` `first_name` varchar(255) not null;')
    }
}
