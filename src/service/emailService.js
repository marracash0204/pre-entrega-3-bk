import nodemailer from "nodemailer";
import config from "../config/config.js";

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: config.emailUser,
        pass: config.emailPass,
      },
    });
  }

  async sendEmail(to, subject, text) {
    try {
      const mailOptions = {
        from: "kirsten.hirthe@ethereal.email",
        to,
        subject,
        text,
      };

      const info = await this.transporter.sendMail(mailOptions);

      console.log("Mensaje enviado: %s", info.messageId);
      console.log(
        "URL de vista previa del mensaje: %s",
        nodemailer.getTestMessageUrl(info)
      );

      return info;
    } catch (error) {
      console.error("Error al enviar el correo electrónico:", error);
      throw error;
    }
  }

  async sendPurchaseConfirmation(email, totalAmount, products) {
    const subject = "Confirmación de compra";
    const text = `Gracias por tu compra. El total de la compra es $${totalAmount}.`;

    try {
      const result = await this.sendEmail(email, subject, text);
      console.log(
        "Correo electrónico de confirmación de compra enviado:",
        result
      );
    } catch (error) {
      console.error(
        "Error al enviar el correo electrónico de confirmación de compra:",
        error
      );
    }
  }
}

export default new EmailService();
