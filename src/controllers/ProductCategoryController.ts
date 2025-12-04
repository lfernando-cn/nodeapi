import express, { Request, Response } from "express"; 
import { AppDataSource } from "../data-source";
import { ProductCategory } from "../entity/ProductCategory";
import { PaginationService } from "../services/PaginationServices";
import * as yup from "yup";

const router = express.Router();

// ==========================
//     SCHEMAS DE VALIDAÇÃO
// ==========================
const productCategorySchema = yup.object({
  nameProductCategory: yup
    .string()
    .required("O campo nameProductCategory é obrigatório.")
    .min(3, "O nome deve ter pelo menos 3 caracteres.")
    .max(255, "O nome deve ter no máximo 255 caracteres."),
});

const updateProductCategorySchema = productCategorySchema.partial();

// ==========================
// LISTAR CATEGORIAS
// ==========================
router.get("/productCategory", async (req: Request, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(ProductCategory);

    const page = Number(req.query.page) || 1;
    const limite = Number(req.query.limite) || 10;

    const result = await PaginationService.paginate(repo, page, limite, { id: "DESC" });

    res.status(200).json(result);

  } catch (error) {
    res.status(500).json({ message: "Erro ao Listar as Categorias de Produto!" });
  }
});

// ==========================
// VISUALIZAR CATEGORIA
// ==========================
router.get("/productCategory/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const repo = AppDataSource.getRepository(ProductCategory);

    const category = await repo.findOneBy({ id: parseInt(id) });

    if (!category) {
      return res.status(404).json({ message: "Categoria de Produto não encontrada!" });
    }

    res.status(200).json(category);

  } catch (error) {
    res.status(500).json({ message: "Erro ao Visualizar a Categoria de Produto!" });
  }
});

// ==========================
// CADASTRAR CATEGORIA
// ==========================
router.post("/productCategory", async (req: Request, res: Response) => {
  try {
    const data = req.body;

    // Validação Yup
    await productCategorySchema.validate(data, { abortEarly: false });

    const repo = AppDataSource.getRepository(ProductCategory);

    // 🔥 Verificar se já existe categoria com o mesmo nome
    const existing = await repo.findOne({
      where: { nameProductCategory: data.nameProductCategory }
    });

    if (existing) {
      return res.status(400).json({
        message: "Já existe uma Categoria de Produto com esse nome!"
      });
    }

    const newCategory = repo.create(data);
    await repo.save(newCategory);

    res.status(201).json({
      message: "Categoria de Produto cadastrada com sucesso!",
      productCategory: newCategory,
    });

  } catch (error: any) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Erro de validação!",
        errors: error.errors,
      });
    }

    res.status(500).json({
      message: "Erro ao cadastrar a Categoria de Produto!",
    });
  }
});

// ==========================
// ATUALIZAR CATEGORIA
// ==========================
router.put("/productCategory/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    await updateProductCategorySchema.validate(data, { abortEarly: false });

    const repo = AppDataSource.getRepository(ProductCategory);

    const category = await repo.findOneBy({ id: parseInt(id) });

    if (!category) {
      return res.status(404).json({
        message: "Categoria de Produto não encontrada!",
      });
    }

    // 🔥 Verificar duplicidade (ignora o próprio ID)
    if (data.nameProductCategory) {
      const exists = await repo.findOne({
        where: { nameProductCategory: data.nameProductCategory }
      });

      if (exists && exists.id !== Number(id)) {
        return res.status(400).json({
          message: "Já existe outra Categoria de Produto com esse nome!"
        });
      }
    }

    repo.merge(category, data);
    const updated = await repo.save(category);

    res.status(200).json({
      message: "Categoria de Produto atualizada com sucesso!",
      productCategory: updated,
    });

  } catch (error: any) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Erro de validação!",
        errors: error.errors,
      });
    }

    res.status(500).json({
      message: "Erro ao atualizar a Categoria de Produto!",
    });
  }
});

// ==========================
// REMOVER CATEGORIA
// ==========================
router.delete("/productCategory/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const repo = AppDataSource.getRepository(ProductCategory);

    const category = await repo.findOneBy({ id: parseInt(id) });

    if (!category) {
      return res.status(404).json({
        message: "Categoria de Produto não encontrada!",
      });
    }

    await repo.remove(category);

    res.status(200).json({
      message: "Categoria de Produto removida com sucesso!",
    });

  } catch (error) {
    res.status(500).json({
      message: "Erro ao remover a Categoria de Produto!",
    });
  }
});

// EXPORTAR ROTAS
export default router;
