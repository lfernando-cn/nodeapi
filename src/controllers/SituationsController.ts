import express, { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Situation } from "../entity/Situation";
import { PaginationService } from "../services/PaginationServices";
import * as Yup from "yup";

const router = express.Router();

// ============================
//  SCHEMA DE VALIDAÇÃO YUP
// ============================
const situationSchema = Yup.object().shape({
  nameSituation: Yup.string()
    .required("O nome da situação é obrigatório.")
    .min(3, "O nome deve ter pelo menos 3 caracteres.")
    .max(100, "O nome deve ter no máximo 100 caracteres."),
});

// Para PUT (parcial)
const updateSituationSchema = Yup.object().shape({
  nameSituation: Yup.string()
    .min(3, "O nome deve ter pelo menos 3 caracteres.")
    .max(100, "O nome deve ter no máximo 100 caracteres."),
});


// ============================
//  LISTAR COM PAGINAÇÃO
// ============================
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

    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({
      message: "Erro ao listar as situações!",
    });
  }
});


// ============================
//  VISUALIZAR POR ID
// ============================
router.get("/situations/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const situationRepository = AppDataSource.getRepository(Situation);
    const situation = await situationRepository.findOneBy({ id: Number(id) });

    if (!situation) {
      return res.status(404).json({
        message: "Situação não encontrada!",
      });
    }

    return res.status(200).json(situation);

  } catch (error) {
    return res.status(500).json({
      message: "Erro ao visualizar a situação!",
    });
  }
});


// ============================
//  CADASTRAR (COM YUP)
// ============================
router.post("/situations", async (req: Request, res: Response) => {
  try {
    const data = req.body;

    // VALIDAR YUP
    try {
      await situationSchema.validate(data, { abortEarly: false });
    } catch (err: any) {
      return res.status(400).json({
        message: "Erro de validação",
        errors: err.errors,
      });
    }

    const situationRepository = AppDataSource.getRepository(Situation);

    // VERIFICAR DUPLICIDADE
    const exists = await situationRepository.findOneBy({
      nameSituation: data.nameSituation,
    });

    if (exists) {
      return res.status(400).json({
        message: "Já existe uma situação com esse nome.",
      });
    }

    const newSituation = situationRepository.create(data);
    await situationRepository.save(newSituation);

    return res.status(201).json({
      message: "Situação cadastrada com sucesso!",
      situation: newSituation,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Erro ao cadastrar a situação!",
    });
  }
});


// ============================
//  ATUALIZAR (COM YUP)
// ============================
router.put("/situations/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const situationRepository = AppDataSource.getRepository(Situation);
    const situation = await situationRepository.findOneBy({ id: Number(id) });

    if (!situation) {
      return res.status(404).json({
        message: "Situação não encontrada!",
      });
    }

    // VALIDAR YUP PARCIAL
    try {
      await updateSituationSchema.validate(data, { abortEarly: false });
    } catch (err: any) {
      return res.status(400).json({
        message: "Erro de validação",
        errors: err.errors,
      });
    }

    // EVITAR DUPLICIDADE
    if (
      data.nameSituation &&
      data.nameSituation !== situation.nameSituation
    ) {
      const exists = await situationRepository.findOneBy({
        nameSituation: data.nameSituation,
      });

      if (exists) {
        return res.status(400).json({
          message: "Já existe uma situação com esse nome.",
        });
      }
    }

    situationRepository.merge(situation, data);
    const updated = await situationRepository.save(situation);

    return res.status(200).json({
      message: "Situação atualizada com sucesso!",
      situation: updated,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Erro ao atualizar a situação!",
    });
  }
});


// ============================
//  REMOVER
// ============================
router.delete("/situations/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const situationRepository = AppDataSource.getRepository(Situation);
    const situation = await situationRepository.findOneBy({ id: Number(id) });

    if (!situation) {
      return res.status(404).json({
        message: "Situação não encontrada!",
      });
    }

    await situationRepository.remove(situation);

    return res.status(200).json({
      message: "Situação removida com sucesso!",
    });

  } catch (error) {
    return res.status(500).json({
      message: "Erro ao remover a situação!",
    });
  }
});

export default router;
