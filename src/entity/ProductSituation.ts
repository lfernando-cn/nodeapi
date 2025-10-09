import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { Product } from "./Product";

@Entity("product_situations")
export class ProductSituation {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({length: 255, unique: true})
    nameProductSituation!: string;

    @Column({type: "timestamp", default:() => "CURRENT_TIMESTAMP"})
    createdAt!: Date;

    @Column({type: "timestamp", default:() => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updatedAt!: Date;

    @OneToMany(() => Product, (product) => product.situation) 
    products!: Product[];
}