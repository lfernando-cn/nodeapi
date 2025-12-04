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

        // Busca a situação "Ativo" e a categoria "Eletrônicos" para usar os IDs
        const activeSituation = await situationRepository.findOneBy({ nameProductSituation: "Ativo" });
        const electronicsCategory = await categoryRepository.findOneBy({ nameProductCategory: "Bebidas" });

        if (!activeSituation || !electronicsCategory) {
            console.error("ERRO: Não foi possível encontrar as referências 'Ativo' ou 'Eletrônicos'. Execute as Seeds de catálogo primeiro!");
            return;
        }

        const products = [
            { 
                nameProduct: "Gin de 10",
                productSituationId: activeSituation.id,
                productCategoryId: electronicsCategory.id,
                Slug: "gin-de-10"
                
            },
            { 
                nameProduct: "Smirnoff",
                productSituationId: activeSituation.id,
                productCategoryId: electronicsCategory.id,
                Slug: "smirnoff"
            },
            { 
                nameProduct: "Corote",
                productSituationId: activeSituation.id,
                productCategoryId: electronicsCategory.id,
                Slug: "corote"
            },
        ];

        //Salvar o array de objetos JSON diretamente
        await productRepository.save(products);

        console.log(`Seed concluído com sucesso: ${products.length} produtos cadastrados.`);
    }
}