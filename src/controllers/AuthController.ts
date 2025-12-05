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
//  VALIDAÇÃO YUP - RECUPERAR SENHA
// ============================
const recoverSchema = Yup.object().shape({
  email: Yup.string()
    .required("O email é obrigatório.")
    .email("Formato de e-mail inválido."),
});

// ============================
//  VALIDAÇÃO YUP - RESETAR SENHA
// ============================
const resetSchema = Yup.object().shape({
  token: Yup.string()
    .required("O token é obrigatório."),
  newPassword: Yup.string()
    .required("A nova senha é obrigatória.")
    .min(6, "A senha deve ter pelo menos 6 caracteres."),
  confirmPassword: Yup.string()
    .required("A confirmação de senha é obrigatória.")
    .min(6, "A senha deve ter pelo menos 6 caracteres.")
    .oneOf([Yup.ref("newPassword")], "As senhas não coincidem."),
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

// ============================
//  RECUPERAR SENHA (GERAR LINK DE RESET)
// ============================
// POST /recover-password
// Body: { "email": "usuario@example.com" }
// Retorna: Link com token para resetar a senha
router.post("/recover-password", async (req: Request, res: Response) => {
  try {
    const data = req.body;

    // VALIDAR YUP
    try {
      await recoverSchema.validate(data, { abortEarly: false });
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
    });

    if (!user) {
      return res.status(404).json({
        message: "Usuário não encontrado!",
      });
    }

    // GERAR TOKEN DE RESET COM EXPIRAÇÃO CURTA (1 hora)
    const resetToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        type: "password_reset",
      },
      process.env.JWT_SECRET || "teste",
      { expiresIn: "1h" }
    );

    // CONSTRUIR LINK DE RESET
    // Adjust the FRONTEND_URL conforme necessário (localhost:3000, sua URL em produção, etc)
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    res.status(200).json({
      message: "Link de recuperação gerado com sucesso!",
      resetLink,
      token: resetToken,
      expiresIn: "1 hora",
      instructions: "Acesse o link acima para resetar sua senha. O link expira em 1 hora.",
    });

  } catch (error) {
    res.status(500).json({
      message: "Erro ao gerar link de recuperação!",
    });
  }
});

// ============================
//  RESETAR SENHA (CONSUMIR TOKEN)
// ============================
// POST /reset-password
// Body: { "token": "jwt_token_aqui", "newPassword": "senha123", "confirmPassword": "senha123" }
router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const data = req.body;

    // VALIDAR YUP
    try {
      await resetSchema.validate(data, { abortEarly: false });
    } catch (err: any) {
      return res.status(400).json({
        message: "Erro de validação",
        errors: err.errors,
      });
    }

    // VERIFICAR E DECODIFICAR TOKEN
    let decoded: any;
    try {
      decoded = jwt.verify(data.token, process.env.JWT_SECRET || "teste");
    } catch (err) {
      return res.status(401).json({
        message: "Token inválido ou expirado!",
      });
    }

    // VALIDAR SE O TOKEN É DO TIPO PASSWORD_RESET
    if (decoded.type !== "password_reset") {
      return res.status(401).json({
        message: "Token inválido!",
      });
    }

    const userRepository = AppDataSource.getRepository(User);

    // BUSCAR USUÁRIO
    const user = await userRepository.findOneBy({ id: decoded.id });

    if (!user) {
      return res.status(404).json({
        message: "Usuário não encontrado!",
      });
    }

    // CRIPTOGRAFAR NOVA SENHA
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    // ATUALIZAR SENHA
    user.password = hashedPassword;
    const updatedUser = await userRepository.save(user);

    res.status(200).json({
      message: "Senha resetada com sucesso!",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    });

  } catch (error) {
    res.status(500).json({
      message: "Erro ao resetar a senha!",
    });
  }
});

export default router;