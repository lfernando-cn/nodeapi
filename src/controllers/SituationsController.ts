// importar a biblioteca do Express
import express, {Request, Response} from "express";
import { AppDataSource } from "../data-source";
import { Situation } from "../entity/Situation";
import { PaginationService } from "../services/PaginationServices";


//Criar a aplicação Express
const router = express.Router();


// Criar a Lista
router.get("/situations",async(req:Request, res:Response)=>{
  try{

    //Obter o repositório da entidade Situation
    const situationRepository = AppDataSource.getRepository(Situation);

    //Receber o número da página e definir página 1 como padrão
    const page = Number(req.query.page) || 1;

    //Definir o limite de registros por página
    const limite = Number(req.query.limite) || 10;


    // Serviço de Paginação
    const result = await PaginationService.paginate(situationRepository, page, limite, {id: "DESC"});

    //Retornar a resposta com os dados e informações da paginação
    res.status(200).json(result); //Lista todos os dados do banco
    return

  }catch(error){
    res.status(500).json({
        message : "Erro ao Listar a situação!",
      });
      return
  }
});

// Criar a Visualização do item cadastrado em situação
router.get("/situations/:id",async(req:Request, res:Response)=>{
  try{

    const {id} = req.params;

    const situationRepository = AppDataSource.getRepository(Situation);

    const situation = await situationRepository.findOneBy({id : parseInt(id)})

    if(!situation){
      res.status(404).json({
        message : "Situação não encontrada!",
      });
      return

    }

    res.status(200).json(situation); //Lista todos os dados do banco
    return

  }catch(error){
    res.status(500).json({
        message : "Erro ao Visualizar a situação!",
      });
      return
  }
});



// Cadastra item no banco de dados
router.post("/situations",async(req:Request, res:Response)=>{

    try{
      var data = req.body;

      const situationRepository = AppDataSource.getRepository(Situation)
      const newSituation = situationRepository.create(data);

      await situationRepository.save(newSituation); //Isso que irá salvar no banco de dados

      res.status(201).json({
        message : "Situação cadastrada com sucesso!",
        situation: newSituation,
      });

    }catch(error){

       res.status(500).json({
        message : "Erro ao cadastrar a situação!",
      });

    }
});

// Faz a atualização do item cadastrado 
router.put("/situations/:id",async(req:Request, res:Response)=>{
  try{

    const {id} = req.params;

    var data = req.body;

    const situationRepository = AppDataSource.getRepository(Situation);

    const situation = await situationRepository.findOneBy({id : parseInt(id)}) //Busca pelo ID digitado

    if(!situation){ //Se passar um ID que não exite ele passa a seguinte mensagem
      res.status(404).json({
        message : "Situação não encontrada!",
      });
      return
    }

    //Atualiza os dados
    situationRepository.merge(situation, data);

    //Salvar as alterações de dados
    const updateSituation = await situationRepository.save(situation);

    res.status(200).json({
      messagem: "Situação atualizada com sucesso!",
      situation: updateSituation,
    }); 
    

  }catch(error){
    res.status(500).json({
        message : "Erro ao Atualizar a situação!",
      });
      return
  }
});

// Remove o item cadastrado no banco de dados
router.delete("/situations/:id",async(req:Request, res:Response)=>{
  try{

    const {id} = req.params;

    const situationRepository = AppDataSource.getRepository(Situation);

    const situation = await situationRepository.findOneBy({id : parseInt(id)}) //Busca pelo ID digitado

    if(!situation){ //Se passar um ID que não exite ele passa a seguinte mensagem
      res.status(404).json({
        message : "Situação não encontrada!",
      });
      return
    }

    //Remove os dados no banco
    await situationRepository.remove(situation);

    res.status(200).json({
      messagem: "Situação foi removida com sucesso!",
    }); 
    

  }catch(error){
    res.status(500).json({
        message : "Erro ao Atualizar a situação!",
      });
      return
  }
});


//Exportar a instrução da rota
export default router
