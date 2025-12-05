import express, { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/Users";
import * as Yup from "yup";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { EmailService } from "../services/EmailService";

const router = express.Router();

// ============================
//  VALIDAÇÕES
// ============================
const loginSchema = Yup.object().shape({
  email: Yup.string().required("O email é obrigatório.").email("Formato de e-mail inválido."),
  password: Yup.string().required("A senha é obrigatória.").min(6, "A senha deve ter pelo menos 6 caracteres."),
});

const recoverSchema = Yup.object().shape({
  email: Yup.string().required("O email é obrigatório.").email("Formato de e-mail inválido."),
});

const resetSchema = Yup.object().shape({
  token: Yup.string().required("O token é obrigatório."),
  newPassword: Yup.string().required("A nova senha é obrigatória.").min(6, "A senha deve ter pelo menos 6 caracteres."),
  confirmPassword: Yup.string()
    .required("A confirmação de senha é obrigatória.")
    .oneOf([Yup.ref("newPassword")], "As senhas não coincidem."),
});

// ============================
//  LOGIN
// ============================
router.post("/login", async (req: Request, res: Response) => {
  try {
    const data = req.body;

    try {
      await loginSchema.validate(data, { abortEarly: false });
    } catch (err: any) {
      return res.status(400).json({ message: "Erro de validação", errors: err.errors });
    }

    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { email: data.email },
      relations: ["situation"],
    });

    if (!user) {
      return res.status(401).json({ message: "Email ou senha incorretos!" });
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Email ou senha incorretos!" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET || "teste",
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      message: "Login realizado com sucesso!",
      token,
      user: { id: user.id, name: user.name, email: user.email, situation: user.situation },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao realizar login!" });
  }
});

// ============================
//  RECUPERAR SENHA (GERAR LINK E ENVIAR EMAIL)
// ============================
router.post("/recover-password", async (req: Request, res: Response) => {
  try {
    const data = req.body;

    try {
      await recoverSchema.validate(data, { abortEarly: false });
    } catch (err: any) {
      return res.status(400).json({ message: "Erro de validação", errors: err.errors });
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email: data.email } });

    // Resposta genérica se não existir (evita enumeração). Porém, para facilitar testes,
    // se o usuário existir iremos gerar token e tentar enviar email.
    if (!user) {
      return res.status(200).json({
        message:
          "Se houver uma conta associada a este e-mail, você receberá instruções para recuperar sua senha.",
      });
    }

    // Gerar reset token com expiração curta
    const resetToken = jwt.sign(
      { id: user.id, email: user.email, type: "password_reset" },
      process.env.JWT_SECRET || "teste",
      { expiresIn: "1h" }
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    // Tentar enviar email
    const emailSent = await EmailService.sendPasswordResetEmail(user.email, resetLink, user.name);

    // Montar payload de resposta
    const responsePayload: any = {
      message: "Se houver uma conta associada a este e-mail, você receberá instruções para recuperar sua senha.",
    };

    // Em ambiente de desenvolvimento incluir o link na resposta para facilitar testes.
    // Se o envio falhar, também incluímos o link para não bloquear testes locais.
    if (process.env.NODE_ENV !== "production" || !emailSent) {
      responsePayload.resetLink = resetLink;
      responsePayload.note = emailSent
        ? "Ambiente não-produção: link retornado para testes."
        : "Envio de email falhou, link retornado para testes locais.";
    }

    return res.status(200).json(responsePayload);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao processar recuperação de senha!" });
  }
});

// ============================
//  RESETAR SENHA (CONSUMIR TOKEN)
// ============================
router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const data = req.body;

    try {
      await resetSchema.validate(data, { abortEarly: false });
    } catch (err: any) {
      return res.status(400).json({ message: "Erro de validação", errors: err.errors });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(data.token, process.env.JWT_SECRET || "teste");
    } catch (err) {
      return res.status(401).json({ message: "Token inválido ou expirado!" });
    }

    if (decoded.type !== "password_reset") {
      return res.status(401).json({ message: "Token inválido!" });
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: decoded.id });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado!" });
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    user.password = hashedPassword;
    const updatedUser = await userRepository.save(user);

    return res.status(200).json({
      message: "Senha resetada com sucesso!",
      user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao resetar a senha!" });
  }
});

export default router;