import { Migration } from '@mikro-orm/migrations'

export class Migration20230729113458 extends Migration {
    async up(): Promise<void> {
        this.addSql(
            'create table `historical_account_balance` (`id` int unsigned not null auto_increment primary key, `created_at` datetime not null, `updated_at` datetime not null, `balance` numeric(10,2) not null default 0, `date` datetime not null, `account_id` int unsigned not null) default character set utf8mb4 engine = InnoDB;'
        )
        this.addSql(
            'alter table `historical_account_balance` add index `historical_account_balance_account_id_index`(`account_id`);'
        )

        this.addSql(
            'alter table `historical_account_balance` add constraint `historical_account_balance_account_id_foreign` foreign key (`account_id`) references `account` (`id`) on update cascade on delete cascade;'
        )
    }

    async down(): Promise<void> {
        this.addSql('drop table if exists `historical_account_balance`;')
    }
}
