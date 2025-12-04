// importar a biblioteca do Express
import express, {Request, Response} from "express";
import { AppDataSource } from "../data-source";
import { Situation } from "../entity/Situation";
import { PaginationService } from "../services/PaginationServices";
import * as yup from "yup";

//Criar a aplicação Express
const router = express.Router();

// Schema de validação com Yup
const situationSchema = yup.object({
  nameSituation: yup
    .string()
    .required("O campo nameSituation é obrigatório.")
    .min(3, "O nome deve ter pelo menos 3 caracteres.")
    .max(100, "O nome deve ter no máximo 100 caracteres."),
});

// Schema parcial para PUT
const updateSituationSchema = situationSchema.partial();


// Criar a Lista
router.get("/situations", async (req: Request, res: Response) => {
  try {
    const situationRepository = AppDataSource.getRepository(Situation);

    const page = Number(req.query.page) || 1;
    const limite = Number(req.query.limite) || 10;

    const result = await PaginationService.paginate(
      situationRepository,
      page,
      limite,
      { id: "DESC" }
    );

    res.status(200).json(result);
    return;

  } catch (error) {
    res.status(500).json({
      message: "Erro ao Listar a situação!",
    });
    return;
  }
});


// Visualização do item cadastrado
router.get("/situations/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const situationRepository = AppDataSource.getRepository(Situation);

    const situation = await situationRepository.findOneBy({
      id: parseInt(id),
    });

    if (!situation) {
      res.status(404).json({
        message: "Situação não encontrada!",
      });
      return;
    }

    res.status(200).json(situation);
    return;

  } catch (error) {
    res.status(500).json({
      message: "Erro ao Visualizar a situação!",
    });
    return;
  }
});



// Cadastrar item no banco de dados
router.post("/situations", async (req: Request, res: Response) => {
  try {
    const data = req.body;

    // Validação Yup
    await situationSchema.validate(data, { abortEarly: false });

    const situationRepository = AppDataSource.getRepository(Situation);
    const newSituation = situationRepository.create(data);

    await situationRepository.save(newSituation);

    res.status(201).json({
      message: "Situação cadastrada com sucesso!",
      situation: newSituation,
    });

  } catch (error: any) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Erro de validação!",
        errors: error.errors,
      });
    }

    res.status(500).json({
      message: "Erro ao cadastrar a situação!",
    });
  }
});



// Atualizar item cadastrado
router.put("/situations/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Validação Yup parcial
    await updateSituationSchema.validate(data, { abortEarly: false });

    const situationRepository = AppDataSource.getRepository(Situation);

    const situation = await situationRepository.findOneBy({
      id: parseInt(id),
    });

    if (!situation) {
      res.status(404).json({
        message: "Situação não encontrada!",
      });
      return;
    }

    situationRepository.merge(situation, data);
    const updateSituation = await situationRepository.save(situation);

    res.status(200).json({
      message: "Situação atualizada com sucesso!",
      situation: updateSituation,
    });

  } catch (error: any) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Erro de validação!",
        errors: error.errors,
      });
    }

    res.status(500).json({
      message: "Erro ao Atualizar a situação!",
    });
    return;
  }
});



// Remover item cadastrado
router.delete("/situations/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const situationRepository = AppDataSource.getRepository(Situation);

    const situation = await situationRepository.findOneBy({
      id: parseInt(id),
    });

    if (!situation) {
      res.status(404).json({
        message: "Situação não encontrada!",
      });
      return;
    }

    await situationRepository.remove(situation);

    res.status(200).json({
      messagem: "Situação foi removida com sucesso!",
    });

  } catch (error) {
    res.status(500).json({
      message: "Erro ao Atualizar a situação!",
    });
    return;
  }
});


//Exportar a instrução da rota
export default router;
