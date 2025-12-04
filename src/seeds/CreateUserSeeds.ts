import { DataSource } from "typeorm";
import { User } from "../entity/Users";
import { Situation } from "../entity/Situation";

export default class CreateUserSeeds {

  public async run(dataSource: DataSource): Promise<void> {
    console.log("Iniciando o seed para a tabela 'users'...");

    const userRepository = dataSource.getRepository(User);
    const existingCount = await userRepository.count();

    // Verifica se já existem registros
    if (existingCount > 0) {
      console.log("A tabela 'users' já possui dados. Nenhuma alteração foi realizada.");
      return;
    }

    // Busca o repositório de situações
    const situationRepository = dataSource.getRepository(Situation);

    // Verifica se existe a situação com ID 1 (ou outro ID padrão)
    const situation = await situationRepository.findOneBy({ id: 1 });

    if (!situation) {
      console.error("ERRO: Não foi possível encontrar a situação com ID 1. Execute as Seeds de 'Situation' primeiro!");
      return;
    }

    // Cria usuários de exemplo, associando diretamente o ID da situação
    const users = [
      {
        name: "Luís Fernando",
        email: "luis.fernando@example.com",
        password: "senha123",
        situation: situation, // ou { id: 1 }
      },
      {
        name: "Maria Silva",
        email: "maria.silva@example.com",
        password: "senha123",
        situation: situation,
      },
      {
        name: "João Pereira",
        email: "joao.pereira@example.com",
        password: "senha123",
        situation: situation,
      },
    ];

    // Salva os usuários
    await userRepository.save(users);

    console.log(`Seed concluído com sucesso: ${users.length} usuários cadastrados.`);
  }
}
