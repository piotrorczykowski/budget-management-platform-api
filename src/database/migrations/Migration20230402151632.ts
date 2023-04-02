import { Migration } from '@mikro-orm/migrations'

export class Migration20230402151632 extends Migration {
    async up(): Promise<void> {
        this.addSql(
            "create table `user` (`id` int unsigned not null auto_increment primary key, `created_at` datetime not null, `updated_at` datetime not null, `username` varchar(30) not null, `first_name` varchar(50) not null, `last_name` varchar(80) not null, `email` varchar(50) not null, `password` varchar(50) not null, `role` enum('ADMIN', 'USER') not null) default character set utf8mb4 engine = InnoDB;"
        )
        this.addSql(
            'alter table `user` add unique `user_username_unique`(`username`);'
        )
        this.addSql(
            'alter table `user` add unique `user_email_unique`(`email`);'
        )
    }

    async down(): Promise<void> {
        this.addSql('drop table if exists `user`;')
    }
}
