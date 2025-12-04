import express, { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { ProductSituation } from "../entity/ProductSituation";
import { PaginationService } from "../services/PaginationServices";
import * as Yup from "yup";

const router = express.Router();

// ============================
//  SCHEMA DE VALIDAÇÃO YUP
// ============================
const productSituationSchema = Yup.object().shape({
  nameProductSituation: Yup.string()
    .required("O nome da situação é obrigatório.")
    .min(2, "O nome deve ter pelo menos 2 caracteres.")
    .max(255, "O nome deve ter no máximo 255 caracteres."),
});


// ============================
//  LISTAR COM PAGINAÇÃO
// ============================
router.get("/product_situations", async (req: Request, res: Response) => {
  try {
    const productSituationRepository = AppDataSource.getRepository(ProductSituation);

    const page = Number(req.query.page) || 1;
    const limite = Number(req.query.limite) || 10;

    const result = await PaginationService.paginate(
      productSituationRepository,
      page,
      limite,
      { id: "DESC" }
    );

    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({
      message: "Erro ao Listar as situações de produtos!",
    });
  }
});


// ============================
//  VISUALIZAR POR ID
// ============================
router.get("/product_situations/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const productSituationRepository = AppDataSource.getRepository(ProductSituation);
    const productSituation = await productSituationRepository.findOneBy({ id: Number(id) });

    if (!productSituation) {
      return res.status(404).json({
        message: "Situação de Produto não encontrada!",
      });
    }

    return res.status(200).json(productSituation);

  } catch (error) {
    return res.status(500).json({
      message: "Erro ao Visualizar as situações de produtos!",
    });
  }
});


// ============================
//  CADASTRAR (COM YUP)
// ============================
router.post("/product_situations", async (req: Request, res: Response) => {
  try {
    const data = req.body;

    // VALIDAR YUP
    try {
      await productSituationSchema.validate(data, { abortEarly: false });
    } catch (err: any) {
      return res.status(400).json({
        message: "Erro de validação",
        errors: err.errors,
      });
    }

    const productSituationRepository = AppDataSource.getRepository(ProductSituation);

    // VERIFICAR DUPLICIDADE
    const exists = await productSituationRepository.findOneBy({
      nameProductSituation: data.nameProductSituation,
    });

    if (exists) {
      return res.status(400).json({
        message: "Já existe uma situação com esse nome.",
      });
    }

    const newProductSituation = productSituationRepository.create(data);
    await productSituationRepository.save(newProductSituation);

    return res.status(201).json({
      message: "Situação de Produto cadastrada com sucesso!",
      situation: newProductSituation,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Erro ao cadastrar a situação de produto!",
    });
  }
});


// ============================
//  ATUALIZAR (COM YUP)
// ============================
router.put("/product_situations/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const productSituationRepository = AppDataSource.getRepository(ProductSituation);
    const productSituation = await productSituationRepository.findOneBy({ id: Number(id) });

    if (!productSituation) {
      return res.status(404).json({
        message: "Situação de Produto não encontrada!",
      });
    }

    // VALIDAR YUP
    try {
      await productSituationSchema.validate(data, { abortEarly: false });
    } catch (err: any) {
      return res.status(400).json({
        message: "Erro de validação",
        errors: err.errors,
      });
    }

    // EVITAR DUPLICIDADE
    if (data.nameProductSituation !== productSituation.nameProductSituation) {
      const exists = await productSituationRepository.findOneBy({
        nameProductSituation: data.nameProductSituation,
      });

      if (exists) {
        return res.status(400).json({
          message: "Já existe uma situação com esse nome.",
        });
      }
    }

    productSituationRepository.merge(productSituation, data);
    const updated = await productSituationRepository.save(productSituation);

    return res.status(200).json({
      message: "Situação de Produto atualizada com sucesso!",
      situation: updated,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Erro ao Atualizar a situação de produto!",
    });
  }
});


// ============================
//  REMOVER
// ============================
router.delete("/product_situations/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const productSituationRepository = AppDataSource.getRepository(ProductSituation);
    const productSituation = await productSituationRepository.findOneBy({ id: Number(id) });

    if (!productSituation) {
      return res.status(404).json({
        message: "Situação de Produto não encontrada!",
      });
    }

    await productSituationRepository.remove(productSituation);

    return res.status(200).json({
      message: "Situação de Produto removida com sucesso!",
    });

  } catch (error) {
    return res.status(500).json({
      message: "Erro ao remover a situação de produto!",
    });
  }
});

export default router;
