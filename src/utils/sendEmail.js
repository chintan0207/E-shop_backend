import nodemailer from "nodemailer";
import { ApiError } from "./ApiError.js";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: "mohinipatel161098@gmail.com",
    pass: "pmizebwxvgymkqtv",
  },
});

const sendEmail = async (to, subject, text, html) => {
  const mailOptions = {
    from: "mohinipatel161098@gmail.com", // sender address
    to, // list of receivers
    subject,
    text,
    html,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.messageId);
   
  } catch (error) {
    console.log("Error sending mail", error);
    throw new ApiError(400, "Error sending email");
  }
};
export { sendEmail };
