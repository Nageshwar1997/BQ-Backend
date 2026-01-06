import nodemailer from "nodemailer";

export const transporterConfig = nodemailer.createTransport({
  host: "smtp.mandrillapp.com",
  port: 587,
  secure: false,
  auth: {
    user: "Ctruh",
    pass: "md-Ap3l4MhOpE1qZyxD70f81g",
  },
  // logger: true,
  // debug: true,
});
