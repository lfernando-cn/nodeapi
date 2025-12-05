import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAIL_USER || "eae320388191c3",
    pass: process.env.MAIL_PASS || "be86917d68e755",
  },
});

export class EmailService {
  static async sendPasswordResetEmail(
    toEmail: string,
    resetLink: string,
    userName: string
  ): Promise<boolean> {
    try {
      const htmlContent = `
        <html>
          <body style="font-family: Arial, sans-serif; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #007bff;">Recuperação de Senha</h2>

              <p>Olá <strong>${userName}</strong>,</p>

              <p>Recebemos uma solicitação para redefinir sua senha. Copie o link abaixo e cole no seu navegador para prosseguir:</p>

              <p style="word-break:break-all; background:#f5f5f5; padding:10px; border-radius:4px;">
                <a href="${resetLink}" style="color:#007bff; text-decoration: none;">${resetLink}</a>
              </p>

              <p style="color:#888; font-size:12px;">
                <strong>Atenção:</strong> Este link expira em 1 hora. Se você não solicitou, ignore este email.
              </p>

              <hr style="border:none; border-top:1px solid #ddd; margin:20px 0;">

              <p style="color:#999; font-size:11px; text-align:center;">Este é um email automático. Não responda.</p>
            </div>
          </body>
        </html>
      `;

      await transporter.sendMail({
        from: "noreply@nodeapi.local",
        to: toEmail,
        subject: "Recuperação de Senha - Node API",
        text: `Olá ${userName}, use o link para redefinir sua senha: ${resetLink} (expira em 1 hora).`,
        html: htmlContent,
      });

      console.log(`Email de recuperação enviado para ${toEmail}`);
      return true;
    } catch (err) {
      console.error("Erro ao enviar email de recuperação:", err);
      return false;
    }
  }

  static async testConnection(): Promise<boolean> {
    try {
      await transporter.verify();
      console.log("Servidor de email verificado com sucesso.");
      return true;
    } catch (err) {
      console.error("Falha ao verificar servidor de email:", err);
      return false;
    }
  }
}