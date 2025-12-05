import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAIL_USER || "eae320388191c3", // você pode usar a env var
    pass: process.env.MAIL_PASS || "be86917d68e755", // substitua pela senha real ou use env var
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
              <p style="text-align:center; margin: 30px 0;">
                <a href="${resetLink}" style="background:#007bff; color:#fff; padding:12px 24px; text-decoration:none; border-radius:6px;">
                  Redefinir Senha
                </a>
              </p>
              <p>copie e cole o link abaixo no seu navegador:</p>
              <p style="word-break:break-all;"><code>${resetLink}</code></p>
              <p style="color:#888; font-size:12px;">Este link expira em 1 hora. Se você não solicitou, ignore este email.</p>
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