import {MigrationInterface, QueryRunner} from "typeorm"

export class TOREFACTORPROPERLY1632079543702 implements MigrationInterface {
  name = 'TOREFACTORPROPERLY1632079543702'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "public"."user_infos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" character varying NOT NULL, "value" character varying NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "UQ_740d1cd1a1883e4039c234c384f" UNIQUE ("key"), CONSTRAINT "PK_dff10c2d65f58909fbd2f88bff5" PRIMARY KEY ("id"))`)
    await queryRunner.query(`CREATE TABLE "public"."users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nickname" character varying NOT NULL, "pass_salted" character varying NOT NULL, "salt" character varying NOT NULL, CONSTRAINT "UQ_ad02a1be8707004cb805a4b5023" UNIQUE ("nickname"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`)
    await queryRunner.query(`CREATE TABLE "public"."groups" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" character varying NOT NULL, "private_key" character varying NOT NULL, "value" character varying NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "UQ_4d9379a258d35fbbc78213c8912" UNIQUE ("key"), CONSTRAINT "UQ_de4f09155700722ef366e41afb4" UNIQUE ("private_key"), CONSTRAINT "PK_659d1483316afb28afd3a90646e" PRIMARY KEY ("id"))`)

    await queryRunner.query(`alter table user_infos
        add constraint user_infos_users_id_fk
        foreign key (user_id) references users
        on update cascade on delete cascade`)

    await queryRunner.query(`alter table groups
        add constraint user_groups_users_id_fk
        foreign key (user_id) references users
        on update cascade on delete cascade`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "public"."groups"`)
    await queryRunner.query(`DROP TABLE "public"."users"`)
    await queryRunner.query(`DROP TABLE "public"."user_infos"`)
  }

}
