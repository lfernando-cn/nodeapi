// Importar bibliotecas
import express, { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/Users";
import { Situation } from "../entity/Situation";
import { PaginationService } from "../services/PaginationServices";

const router = express.Router();

// Listar usuários com paginação
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

// Buscar usuário por ID
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

// Cadastrar novo usuário
router.post("/users", async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const userRepository = AppDataSource.getRepository(User);
    const situationRepository = AppDataSource.getRepository(Situation);

    const situation = await situationRepository.findOneBy({
      id: data.situationId,
    });

    if (!situation) {
      res.status(400).json({
        message: "Situação informada não existe!",
      });
      return;
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

// Atualizar usuário
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

    if (data.situationId) {
      const situation = await situationRepository.findOneBy({
        id: data.situationId,
      });

      if (!situation) {
        res.status(400).json({
          message: "Situação informada não existe!",
        });
        return;
      }

      data.situation = situation;
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

// Deletar usuário
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
