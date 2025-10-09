import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateProductCategoryTable1758842387382 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
               await queryRunner.createTable(new Table({
                   name: "product_categories", 
                   columns: [
                       {
                           name: "id",
                           type: "int",
                           isPrimary: true,
                           isGenerated: true,
                           generationStrategy: "increment"
                       },{
                           name: "nameProductCategory",
                           type: "varchar",
                           length: '255',
                           isUnique: true
                       },{
                           name: "createdAt",
                           type: "timestamp",
                           default: "CURRENT_TIMESTAMP"
                       },{
                           name: "updatedAt",
                           type: "timestamp",
                           default: "CURRENT_TIMESTAMP",
                           onUpdate: "CURRENT_TIMESTAMP"
                       }
                   ]
               }));
           }
       
           public async down(queryRunner: QueryRunner): Promise<void> {
               await queryRunner.dropTable("product_categories")
           }
   

}
