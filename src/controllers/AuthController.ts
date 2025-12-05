import express, { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/Users";
import * as Yup from "yup";
import bcrypt from "bcrypt"; // ou "bcryptjs" se preferir
import jwt from "jsonwebtoken";

const router = express.Router();

// ============================
//  VALIDAÇÃO YUP - LOGIN
// ============================
const loginSchema = Yup.object().shape({
  email: Yup.string()
    .required("O email é obrigatório.")
    .email("Formato de e-mail inválido."),
  password: Yup.string()
    .required("A senha é obrigatória.")
    .min(6, "A senha deve ter pelo menos 6 caracteres."),
});

// ============================
//  LOGIN
// ============================
router.post("/login", async (req: Request, res: Response) => {
  try {
    const data = req.body;

    // VALIDAR YUP
    try {
      await loginSchema.validate(data, { abortEarly: false });
    } catch (err: any) {
      return res.status(400).json({
        message: "Erro de validação",
        errors: err.errors,
      });
    }

    const userRepository = AppDataSource.getRepository(User);

    // BUSCAR USUÁRIO POR EMAIL
    const user = await userRepository.findOne({
      where: { email: data.email },
      relations: ["situation"],
    });

    if (!user) {
      return res.status(401).json({
        message: "Email ou senha incorretos!",
      });
    }

    // VERIFICAR SENHA
    const passwordMatch = await bcrypt.compare(data.password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Email ou senha incorretos!",
      });
    }

    // GERAR TOKEN JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET || "teste",
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Login realizado com sucesso!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        situation: user.situation,
      },
    });

  } catch (error) {
    res.status(500).json({
      message: "Erro ao realizar login!",
    });
  }
});

export default router;