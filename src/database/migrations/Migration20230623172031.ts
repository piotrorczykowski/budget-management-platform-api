import { Migration } from '@mikro-orm/migrations'

export class Migration20230623172031 extends Migration {
    async up(): Promise<void> {
        this.addSql(
            'create table `account` (`id` int unsigned not null auto_increment primary key, `created_at` datetime not null, `updated_at` datetime not null, `name` varchar(30) not null, `balance` int not null, `user_id` int unsigned not null) default character set utf8mb4 engine = InnoDB;'
        )
        this.addSql('alter table `account` add unique `account_name_unique`(`name`);')
        this.addSql('alter table `account` add index `account_user_id_index`(`user_id`);')

        this.addSql(
            'alter table `account` add constraint `account_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade on delete cascade;'
        )

        this.addSql("alter table `user` modify `currency` enum('PLN', 'EUR', 'USD', 'GBP') not null default 'PLN';")
    }

    async down(): Promise<void> {
        this.addSql('drop table if exists `account`;')

        this.addSql("alter table `user` modify `currency` enum('PLN', 'EUR', 'USD', 'GBP') not null;")
    }
}
