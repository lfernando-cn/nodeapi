import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddSlugToProducts1764873309747 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("products", new TableColumn({
            name: "slug",
            type: "varchar",
            isNullable: false,
            isUnique: true,
        }));

        await queryRunner.query(`ALTER TABLE products MODIFY COLUMN slug VARCHAR(255) AFTER name`);   
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
