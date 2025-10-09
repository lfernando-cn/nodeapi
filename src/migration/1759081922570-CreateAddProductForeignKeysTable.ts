import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class AddProductForeignKeys1759081550000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Adiciona a FK para Situation
        await queryRunner.createForeignKey("products", new TableForeignKey({
            columnNames: ["productSituationId"],
            referencedTableName: "product_situations",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
        }));

        // Adiciona a FK para Category
        await queryRunner.createForeignKey("products", new TableForeignKey({
            columnNames: ["productCategoryId"],
            referencedTableName: "product_categories",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("products");
        const foreignKey1 = table?.foreignKeys.find((fk)=>fk.columnNames.includes("productSituationId"));
        const foreignKey2 = table?.foreignKeys.find((fk)=>fk.columnNames.includes("productCategoryId"));
        
        if (foreignKey1) {
            await queryRunner.dropForeignKey("products", foreignKey1);
        }

        if (foreignKey2) {
            await queryRunner.dropForeignKey("products", foreignKey2);
        }
    
    }
}
