import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToMany, ManyToMany, ManyToOne } from "typeorm"
import { ProductSituation } from "./ProductSituation";
import { ProductCategory } from "./ProductCategory";
import { Situation } from "./Situation";

@Entity("products")
export class Product {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({length: 255})
    nameProduct!: string;

    @Column({ name: 'slug', unique: true })
    Slug!: string;

    @Column({ name: 'productSituationId' }) 
    productSituationId!: number;

    
    @ManyToOne(() => ProductSituation) 
    @JoinColumn ({name: 'productSituationId'})
    situation!: ProductSituation;

    @Column({ name: 'productCategoryId' }) 
    productCategoryId!: number;

    
    @ManyToOne(() => ProductCategory) 
    @JoinColumn ({name: 'productCategoryId'})
    category!: ProductCategory;

    @Column({type: "timestamp", default:() => "CURRENT_TIMESTAMP"})
    createdAt!: Date;

    @Column({type: "timestamp", default:() => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updatedAt!: Date;

}