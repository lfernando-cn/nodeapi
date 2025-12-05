import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class PriceProduct1764898820682 implements MigrationInterface {

     public async up(queryRunner: QueryRunner): Promise<void> {
            await queryRunner.addColumn("products", new TableColumn({
                name: "price",
                type: "decimal",
                precision: 10,
            }));
    await queryRunner.query(`ALTER TABLE products MODIFY COLUMN price DECIMAL(10) AFTER slug`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("products", "price");
    }

}
