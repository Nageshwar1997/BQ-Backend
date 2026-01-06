import nodemailer from "nodemailer";
import {
  CTRUH_MAIL_HOST,
  CTRUH_MAIL_PASS,
  CTRUH_MAIL_USER,
  IS_DEV,
  MAIL_PORT,
  MY_MAIL_HOST,
  MY_MAIL_PASS,
  MY_MAIL_USER,
} from "../../envs";

export const transporterConfig = nodemailer.createTransport({
  host: IS_DEV === "true" ? MY_MAIL_HOST : CTRUH_MAIL_HOST,
  port: Number(MAIL_PORT),
  secure: false,
  auth: {
    user: IS_DEV === "true" ? MY_MAIL_USER : CTRUH_MAIL_USER,
    pass: IS_DEV === "true" ? MY_MAIL_PASS : CTRUH_MAIL_PASS,
  },
  tls: { ciphers: "SSLv3" },
});
