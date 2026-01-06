import nodemailer from "nodemailer";

export const transporterConfig = nodemailer.createTransport({
  host: "smtp.mandrillapp.com",
  port: 465,
  secure: true,
  auth: {
    user: "Ctruh",
    pass: "md-Ap3l4MhOpE1qZyxD70f81g",
  },
  // logger: true,
  // debug: true,
});
