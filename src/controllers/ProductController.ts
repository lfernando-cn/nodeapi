import express, { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Product } from "../entity/Product";
import { PaginationService } from "../services/PaginationServices";
import * as yup from "yup";

const router = express.Router();

// ==========================
//     SCHEMAS DE VALIDAÇÃO
// ==========================
const productSchema = yup.object({
  nameProduct: yup
    .string()
    .required("O campo nameProduct é obrigatório.")
    .min(3, "O nome deve ter pelo menos 3 caracteres.")
    .max(255, "O nome deve ter no máximo 255 caracteres."),

  productSituationId: yup
    .number()
    .required("O campo productSituationId é obrigatório.")
    .typeError("productSituationId deve ser um número."),

  productCategoryId: yup
    .number()
    .required("O campo productCategoryId é obrigatório.")
    .typeError("productCategoryId deve ser um número."),
});

const updateProductSchema = productSchema.partial();

// ==========================
// LISTAR PRODUTOS
// ==========================
router.get("/products", async (req: Request, res: Response) => {
  try {
    const productRepository = AppDataSource.getRepository(Product);

    const page = Number(req.query.page) || 1;
    const limite = Number(req.query.limite) || 10;

    const result = await PaginationService.paginate(
      productRepository,
      page,
      limite,
      { id: "DESC" }
    );

    res.status(200).json(result);
    return;

  } catch (error) {
    res.status(500).json({
      message: "Erro ao Listar os produtos!",
    });
  }
});

// ==========================
// VISUALIZAR PRODUTO
// ==========================
router.get("/products/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const productRepository = AppDataSource.getRepository(Product);

    const product = await productRepository.findOneBy({
      id: parseInt(id),
    });

    if (!product) {
      res.status(404).json({ message: "Produto não encontrado!" });
      return;
    }

    res.status(200).json(product);
    return;

  } catch (error) {
    res.status(500).json({
      message: "Erro ao Visualizar o produto!",
    });
  }
});

// ==========================
// CADASTRAR PRODUTO
// ==========================
router.post("/products", async (req: Request, res: Response) => {
  try {
    const data = req.body;

    // Validação Yup
    await productSchema.validate(data, { abortEarly: false });

    const productRepository = AppDataSource.getRepository(Product);

    // 🔥 Verifica se já existe produto com o mesmo nome
    const existing = await productRepository.findOne({
      where: { nameProduct: data.nameProduct }
    });

    if (existing) {
      return res.status(400).json({
        message: "Já existe um produto cadastrado com esse nome!"
      });
    }

    const newProduct = productRepository.create(data);
    await productRepository.save(newProduct);

    res.status(201).json({
      message: "Produto cadastrado com sucesso!",
      product: newProduct,
    });

  } catch (error: any) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Erro de validação!",
        errors: error.errors,
      });
    }

    res.status(500).json({
      message: "Erro ao cadastrar o produto!",
    });
  }
});

// ==========================
// ATUALIZAR PRODUTO
// ==========================
router.put("/products/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    await updateProductSchema.validate(data, { abortEarly: false });

    const productRepository = AppDataSource.getRepository(Product);

    const product = await productRepository.findOneBy({
      id: parseInt(id),
    });

    if (!product) {
      res.status(404).json({ message: "Produto não encontrado!" });
      return;
    }

    // 🔥 Verifica duplicidade ao atualizar (ignora o próprio produto)
    if (data.nameProduct) {
      const exists = await productRepository.findOne({
        where: { nameProduct: data.nameProduct }
      });

      if (exists && exists.id !== Number(id)) {
        return res.status(400).json({
          message: "Já existe outro produto com esse nome!"
        });
      }
    }

    productRepository.merge(product, data);

    const updateProduct = await productRepository.save(product);

    res.status(200).json({
      message: "Produto atualizado com sucesso!",
      product: updateProduct,
    });

  } catch (error: any) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Erro de validação!",
        errors: error.errors,
      });
    }

    res.status(500).json({
      message: "Erro ao Atualizar o produto!",
    });
  }
});

// ==========================
// REMOVER PRODUTO
// ==========================
router.delete("/products/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const productRepository = AppDataSource.getRepository(Product);

    const product = await productRepository.findOneBy({
      id: parseInt(id),
    });

    if (!product) {
      res.status(404).json({ message: "Produto não encontrado!" });
      return;
    }

    await productRepository.remove(product);

    res.status(200).json({
      message: "Produto removido com sucesso!",
    });

  } catch (error) {
    res.status(500).json({
      message: "Erro ao remover o produto!",
    });
  }
});

// ==========================
// EXPORTAR ROTAS
// ==========================
export default router;
