import { Migration } from '@mikro-orm/migrations'

export class Migration20230624153234 extends Migration {
    async up(): Promise<void> {
        this.addSql(
            "create table `record` (`id` int unsigned not null auto_increment primary key, `created_at` datetime not null, `updated_at` datetime not null, `amount` numeric(10,2) not null default 0, `date` datetime not null, `is_expense` tinyint(1) not null default true, `category` enum('Food', 'Shopping', 'Housing', 'Transportation', 'Vehicle', 'Entertainment', 'Communication', 'Financial Expenses', 'Income', 'Other') not null default 'Other', `description` varchar(255) not null, `account_id` int unsigned not null) default character set utf8mb4 engine = InnoDB;"
        )
        this.addSql('alter table `record` add index `record_account_id_index`(`account_id`);')

        this.addSql(
            'alter table `record` add constraint `record_account_id_foreign` foreign key (`account_id`) references `account` (`id`) on update cascade on delete cascade;'
        )
    }

    async down(): Promise<void> {
        this.addSql('drop table if exists `record`;')
    }
}
