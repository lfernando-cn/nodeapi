import { DataSource } from "typeorm";
import { Product } from "../entity/Product";
import { ProductSituation } from "../entity/ProductSituation";
import { ProductCategory } from "../entity/ProductCategory";
import slugify from "slugify";

export default class CreateProductSeeds {

    public async run(dataSource: DataSource): Promise<void> {
        console.log("Iniciando o seed para a tabela 'products'...");

        const productRepository = dataSource.getRepository(Product);
        const existingCount = await productRepository.count();

        if (existingCount > 0) {
            console.log("A tabela 'products' já possui dados. Nenhuma alteração foi realizada.");
            return;
        }

        // Busca IDs de referência 
        const situationRepository = dataSource.getRepository(ProductSituation);
        const categoryRepository = dataSource.getRepository(ProductCategory);

        // Busca a situação "Ativo" e a categoria "Bebidas" para usar os IDs
        const activeSituation = await situationRepository.findOneBy({ nameProductSituation: "Ativo" });
        const electronicsCategory = await categoryRepository.findOneBy({ nameProductCategory: "Bebidas" });

        if (!activeSituation || !electronicsCategory) {
            console.error("ERRO: Não foi possível encontrar as referências 'Ativo' ou 'Bebidas'. Execute as Seeds de catálogo primeiro!");
            return;
        }

        const products = [
            { 
                nameProduct: "Gin de 10",
                productSituationId: activeSituation.id,
                productCategoryId: electronicsCategory.id,
                Slug: "gin-de-10",
                price: 49.90,
                description: "Gin nacional, sabor marcante e ótimo custo-benefício."
            },
            { 
                nameProduct: "Smirnoff",
                productSituationId: activeSituation.id,
                productCategoryId: electronicsCategory.id,
                Slug: "smirnoff",
                price: 32.00,
                description: "Vodka Smirnoff, clássica e ideal para drinks."
            },
            { 
                nameProduct: "Corote",
                productSituationId: activeSituation.id,
                productCategoryId: electronicsCategory.id,
                Slug: "corote",
                price: 7.50,
                description: "Corote sabor limão, bebida popular e refrescante."
            },
        ];

        //Salvar o array de objetos JSON diretamente
        await productRepository.save(products);

        console.log(`Seed concluído com sucesso: ${products.length} produtos cadastrados.`);
    }
}