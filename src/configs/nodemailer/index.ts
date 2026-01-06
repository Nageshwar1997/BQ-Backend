import nodemailer from "nodemailer";
import { CTRUH_MAIL_HOST, CTRUH_MAIL_PASS, CTRUH_MAIL_USER } from "../../envs";

export const transporterConfig = nodemailer.createTransport({
  host: CTRUH_MAIL_HOST,
  port: 465,
  secure: true,
  auth: {
    user: CTRUH_MAIL_USER,
    pass: CTRUH_MAIL_PASS,
  },
  logger: true,
  debug: true,
});
