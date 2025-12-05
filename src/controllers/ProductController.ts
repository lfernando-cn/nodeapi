import express, { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Product } from "../entity/Product";
import { PaginationService } from "../services/PaginationServices";
import * as yup from "yup";
import slugify from "slugify";

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

  Slug: yup
    .string()
    .trim()
    .matches(/^[a-z0-9-]+$/, "Slug inválido. Use apenas letras minúsculas, números e hífens.")
    .max(255, "Slug deve ter no máximo 255 caracteres.")
    .optional(),

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
// GERAÇÃO AUTOMÁTICA DO SLUG
// ==========================
function generateSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true, // remove caracteres especiais
    replacement: "-", // substitui espaços por hífen
  });
}


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
router.post("/", async (req: Request, res: Response) => {
  try {
    const data = req.body;

    await productSchema.validate(data, { abortEarly: false });

    const productRepository = AppDataSource.getRepository(Product);

    // 🔥 Criar slug automaticamente se não vier
    if (!data.Slug) {
      data.Slug = generateSlug(data.nameProduct);
    } else {
      // 🔥 Normalizar o slug enviado
      data.Slug = generateSlug(data.Slug);
    }

    // 🔥 Verifica se já existe produto com o mesmo nome
    const existingByName = await productRepository.findOne({
      where: { nameProduct: data.nameProduct }
    });

    if (existingByName) {
      return res.status(400).json({
        message: "Já existe um produto cadastrado com esse nome!"
      });
    }

    // 🔥 Verifica slug duplicado
    const existingBySlug = await productRepository.findOne({
      where: { Slug: data.Slug }
    });

    if (existingBySlug) {
      return res.status(400).json({
        message: "Já existe um produto com esse slug!"
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

    // 🔥 Se atualizar nome, gerar novo slug se não for enviado
    if (data.nameProduct && !data.Slug) {
      data.Slug = generateSlug(data.nameProduct);
    }

    // 🔥 Se enviar slug manualmente, normaliza ele
    if (data.Slug) {
      data.Slug = generateSlug(data.Slug);
    }

    // 🔥 Verifica duplicidade no nome
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

    // 🔥 Verifica duplicidade no slug
    if (data.Slug) {
      const exists = await productRepository.findOne({
        where: { Slug: data.Slug }
      });

      if (exists && exists.id !== Number(id)) {
        return res.status(400).json({
          message: "Já existe outro produto com esse slug!"
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
// BUSCAR PRODUTO POR SLUG (RETORNA PRICE E DESCRIPTION)
// ==========================
router.get("/products/slug/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const productRepository = AppDataSource.getRepository(Product);

    const product = await productRepository.findOne({
      where: { Slug: slug },
      select: ["id", "nameProduct", "Slug", "price", "description"] as any, // seleciona somente os campos necessários
    });

    if (!product) {
      return res.status(404).json({ message: "Produto não encontrado!" });
    }

    return res.status(200).json({
      id: product.id,
      nameProduct: product.nameProduct,
      slug: product.Slug,
      price: product.price,
      description: product.description,
    });
  } catch (error) {
    console.error("Erro ao buscar produto por slug:", error);
    return res.status(500).json({ message: "Erro ao buscar produto!" });
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

export default router;
