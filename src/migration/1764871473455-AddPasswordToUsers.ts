import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddPasswordToUsers1764871473455 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('users', new TableColumn({
            name: "password",
            type: "varchar",
            isNullable: false,
        }));

       await queryRunner.query(`ALTER TABLE users MODIFY COLUMN password VARCHAR(255) AFTER email`);

    }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("users", "password");
}

}
