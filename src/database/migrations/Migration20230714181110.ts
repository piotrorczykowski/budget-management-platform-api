import { Migration } from '@mikro-orm/migrations'

export class Migration20230714181110 extends Migration {
    async up(): Promise<void> {
        this.addSql(
            'create table `budget` (`id` int unsigned not null auto_increment primary key, `created_at` datetime not null, `updated_at` datetime not null, `name` varchar(30) not null, `planned` numeric(10,2) not null default 0, `spent` numeric(10,2) not null default 0, `start_date` datetime not null, `end_date` datetime not null, `categories` text not null, `user_id` int unsigned not null) default character set utf8mb4 engine = InnoDB;'
        )
        this.addSql('alter table `budget` add unique `budget_name_unique`(`name`);')
        this.addSql('alter table `budget` add index `budget_user_id_index`(`user_id`);')
        this.addSql(
            'alter table `budget` add constraint `budget_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade on delete cascade;'
        )
    }

    async down(): Promise<void> {
        this.addSql('drop table if exists `budget`;')
    }
}
