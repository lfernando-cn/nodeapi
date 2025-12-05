import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class DescriptionProduct1764898834666 implements MigrationInterface {

     public async up(queryRunner: QueryRunner): Promise<void> {
                await queryRunner.addColumn("products", new TableColumn({
                    name: "description",
                    type: "text",
                    isNullable: true,
                }));

                await queryRunner.query(`ALTER TABLE products MODIFY COLUMN description TEXT AFTER price`);
        }
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("products", "description");
    }

}
