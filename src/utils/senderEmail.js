import nodemailer from "nodemailer";
import config from "../config/config.js"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "codefanaticsspaceapps@gmail.com",
    pass: config.googleAppPass
  }
});

const sendEmail = async ({ to, subject, text }) => {
  try {
    const info = await transporter.sendMail({
      from: '"CodeFanatics 🚀" <codefanaticsspaceapps@gmail.com>',
      to,
      subject,
      text,
    });

    console.log(`Email sent to ${to}: ${info.messageId}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
  }
};

export default sendEmail