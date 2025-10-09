import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateProductTable1758842353147 implements MigrationInterface {

     public async up(queryRunner: QueryRunner): Promise<void> {
                await queryRunner.createTable(new Table({
                    name: "products", 
                    columns: [
                        {
                            name: "id",
                            type: "int",
                            isPrimary: true,
                            isGenerated: true,
                            generationStrategy: "increment"
                        },{
                            name: "nameProduct",
                            type: "varchar",
                            length: '255',
                        },{
                            name: 'productSituationId',
                            type: 'int',
                            isNullable: false,

                        },{
                            name: 'productCategoryId',
                            type: 'int',
                            isNullable: false,

                        },{
                            name: "createdAt",
                            type: "timestamp",
                            default: "CURRENT_TIMESTAMP"
                        },{
                            name: "updatedAt",
                            type: "timestamp",
                            default: "CURRENT_TIMESTAMP",
                            onUpdate: "CURRENT_TIMESTAMP"
                        },
                    ],
                }));

            }
        
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("products")
    }

}
