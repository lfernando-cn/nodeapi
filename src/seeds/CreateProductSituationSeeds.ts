import { DataSource } from "typeorm";
import { ProductSituation } from "../entity/ProductSituation";

export default class CreateProductSituationSeeds {

    public async run(dataSource: DataSource): Promise<void> {
        console.log("Iniciando o seed para a tabela 'product_situations'...");

        const situationRepository = dataSource.getRepository(ProductSituation);
        const existingCount = await situationRepository.count();

        if (existingCount > 0) {
            console.log("A tabela 'product_situations' já possui dados. Nenhuma alteração foi realizada.");
            return;
        }

        const situationsProductSituations = [
            { nameProductSituation: "Ativo" },
            { nameProductSituation: "Inativo" },
            { nameProductSituation: "Esgotado" },
            { nameProductSituation: "Em liquidação" },
        ];

       // 1. Converte o array de JSON em um array de instâncias de ProductCategory
        const newSituation = situationsProductSituations.map(data => situationRepository.create(data));
        

       //Salva o array de objetos JSON diretamente 
        await situationRepository.save(newSituation);

        console.log("Seed concluído com sucesso: situações de produto cadastradas!");
    }
}