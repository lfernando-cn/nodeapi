import { DataSource } from "typeorm";
import { ProductCategory } from "../entity/ProductCategory";

export default class CreateProductCategorySeeds {

    public async run(dataSource: DataSource): Promise<void> {
        console.log("Iniciando o seed para a tabela 'product_categories'...");

        const categoryRepository = dataSource.getRepository(ProductCategory);
        const existingCount = await categoryRepository.count();

        if (existingCount > 0) {
            console.log("A tabela 'product_categories' já possui dados. Nenhuma alteração foi realizada.");
            return;
        }

        const categoriesProductCategories = [
            { nameProductCategory: "Bebidas" },
            { nameProductCategory: "Vestuário" },
            { nameProductCategory: "Livros" },
            { nameProductCategory: "Alimentos" },
        ];


        
        // Salva o array de objetos JSON diretamente
        await categoryRepository.save(categoriesProductCategories);

        console.log("Seed concluído com sucesso: categorias de produto cadastradas!");
    }
}