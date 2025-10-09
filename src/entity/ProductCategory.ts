import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { Product } from "./Product";

@Entity("product_categories")
export class ProductCategory {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({length: 255, unique: true})
    nameProductCategory!: string;

    @Column({type: "timestamp", default:() => "CURRENT_TIMESTAMP"})
    createdAt!: Date;

    @Column({type: "timestamp", default:() => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updatedAt!: Date;

 @OneToMany(() => Product, (product) => product.category) //Relacionamento de 1 : N
    products!: Product[];
}