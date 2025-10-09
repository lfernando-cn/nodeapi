import {DataSource} from "typeorm"
import { Situation } from "../entity/Situation"

export default class CreateSituationSeeds {

    public async run (dataSource: DataSource): Promise<void>{
        console.log ("Iniciando o seed para a tabela 'situation' ...")

        const situationRepository = dataSource.getRepository(Situation);

        const existingCount = await situationRepository.count()

        if (existingCount > 0){
            console.log("A tabela 'situations' já existe possuí dados. Nenhuma alteração foi realizada");
            return;
        }

        const situations = [
            {nameSituation: "Ativo"},
            {nameSituation: "Inativo"},
            {nameSituation: "Pedente"},
        ]

        //Salva o array de objetos JSON diretamente 
        await situationRepository.save(situations);

        console.log("Seed concluído com sucesso: situações cadastradas")
    }

}