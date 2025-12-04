// Importar bibliotecas
import express, { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/Users";
import { Situation } from "../entity/Situation";
import { PaginationService } from "../services/PaginationServices";
import * as Yup from "yup";

const router = express.Router();

// ============================
//  VALIDAÇÃO YUP
// ============================
const userSchema = Yup.object().shape({
  name: Yup.string()
    .required("O nome é obrigatório.")
    .min(2, "O nome deve ter no mínimo 2 caracteres.")
    .max(255, "O nome deve ter no máximo 255 caracteres."),
  email: Yup.string()
    .required("O email é obrigatório.")
    .email("Formato de e-mail inválido."),
  situationId: Yup.number()
    .required("O campo situationId é obrigatório.")
    .typeError("O situationId deve ser um número."),
});


// ============================
//  LISTAR USUÁRIOS COM PAGINAÇÃO
// ============================
router.get("/users", async (req: Request, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);

    const page = Number(req.query.page) || 1;
    const limite = Number(req.query.limite) || 10;

    const result = await PaginationService.paginate(
      userRepository,
      page,
      limite,
      { id: "DESC" }
    );

    res.status(200).json(result);
    return;
  } catch (error) {
    res.status(500).json({
      message: "Erro ao listar os usuários!",
    });
    return;
  }
});


// ============================
//  BUSCAR POR ID
// ============================
router.get("/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { id: parseInt(id) },
      relations: ["situation"],
    });

    if (!user) {
      res.status(404).json({
        message: "Usuário não encontrado!",
      });
      return;
    }

    res.status(200).json(user);
    return;
  } catch (error) {
    res.status(500).json({
      message: "Erro ao visualizar o usuário!",
    });
    return;
  }
});


// ============================
//  CADASTRAR USUÁRIO (COM YUP)
// ============================
router.post("/users", async (req: Request, res: Response) => {
  try {
    const data = req.body;

    // VALIDAR YUP
    try {
      await userSchema.validate(data, { abortEarly: false });
    } catch (err: any) {
      return res.status(400).json({
        message: "Erro de validação",
        errors: err.errors,
      });
    }

    const userRepository = AppDataSource.getRepository(User);
    const situationRepository = AppDataSource.getRepository(Situation);

    // SITUATION EXISTE?
    const situation = await situationRepository.findOneBy({
      id: data.situationId,
    });

    if (!situation) {
      return res.status(400).json({
        message: "Situação informada não existe!",
      });
    }

    // EMAIL DUPLICADO
    const existsEmail = await userRepository.findOneBy({
      email: data.email,
    });

    if (existsEmail) {
      return res.status(400).json({
        message: "Este e-mail já está cadastrado!",
      });
    }

    const newUser = userRepository.create({
      name: data.name,
      email: data.email,
      situation: situation,
    });

    await userRepository.save(newUser);

    res.status(201).json({
      message: "Usuário cadastrado com sucesso!",
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao cadastrar o usuário!",
    });
    return;
  }
});


// ============================
//  ATUALIZAR USUÁRIO (COM YUP)
// ============================
router.put("/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const userRepository = AppDataSource.getRepository(User);
    const situationRepository = AppDataSource.getRepository(Situation);

    const user = await userRepository.findOneBy({ id: parseInt(id) });

    if (!user) {
      res.status(404).json({
        message: "Usuário não encontrado!",
      });
      return;
    }

    // VALIDAR YUP
    try {
      await userSchema.validate(data, { abortEarly: false });
    } catch (err: any) {
      return res.status(400).json({
        message: "Erro de validação",
        errors: err.errors,
      });
    }

    // SE FOR ATUALIZAR A SITUAÇÃO — VALIDAR
    if (data.situationId) {
      const situation = await situationRepository.findOneBy({
        id: data.situationId,
      });

      if (!situation) {
        return res.status(400).json({
          message: "Situação informada não existe!",
        });
      }

      data.situation = situation;
    }

    // EVITAR DUPLICIDADE DE E-MAIL AO ALTERAR
    if (data.email && data.email !== user.email) {
      const existsEmail = await userRepository.findOneBy({
        email: data.email,
      });

      if (existsEmail) {
        return res.status(400).json({
          message: "Este e-mail já está cadastrado!",
        });
      }
    }

    userRepository.merge(user, data);
    const updatedUser = await userRepository.save(user);

    res.status(200).json({
      message: "Usuário atualizado com sucesso!",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao atualizar o usuário!",
    });
    return;
  }
});


// ============================
//  DELETAR USUÁRIO
// ============================
router.delete("/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOneBy({ id: parseInt(id) });

    if (!user) {
      res.status(404).json({
        message: "Usuário não encontrado!",
      });
      return;
    }

    await userRepository.remove(user);

    res.status(200).json({
      message: "Usuário removido com sucesso!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao remover o usuário!",
    });
    return;
  }
});

export default router;
