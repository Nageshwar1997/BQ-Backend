import { convert } from "html-to-text";
import { transporterConfig } from "../configs";
import { CTRUH_MAIL_FROM, IS_DEV, MY_MAIL_FROM } from "../envs";
import {
  getNewPasswordHtmlMessage,
  getOtpHtmlMessage,
  getPasswordResetHtmlMessage,
} from "../utils";

class EmailService {
  private transporter;

  constructor() {
    this.transporter = transporterConfig;
  }

  // Test connection
  public async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log("📪 Email server ready");
    } catch (err) {
      console.error("❌ Email server connection failed", err);
    }
  }

  // Generic send email
  public async sendMail(options: {
    to: string;
    subject: string;
    htmlOrText: string;
  }) {
    // const htmlToText =
    const text = convert(options.htmlOrText, {
      wordwrap: 130,
    });
    return this.transporter.sendMail({
      from: `Beautinique <${
        IS_DEV === "true" ? MY_MAIL_FROM : CTRUH_MAIL_FROM
      }>`,
      to: options.to,
      subject: options.subject,
      text,
      html: options.htmlOrText,
    });
  }

  // OTP Email
  public async sendOtpEmail(to: string, otp: string) {
    const html = getOtpHtmlMessage("OTP Verification", otp);
    await this.sendMail({ to, subject: "Your OTP Code 🔑", htmlOrText: html });
  }
  // Password Reset Email
  public async sendPasswordResetEmail(to: string, resetLink: string) {
    const html = getPasswordResetHtmlMessage("Password Reset", resetLink);
    await this.sendMail({ to, subject: "Password Reset", htmlOrText: html });
  }
  // New Password Email
  public async sendNewPasswordEmail(
    to: string,
    password: string,
    link: string
  ) {
    const html = getNewPasswordHtmlMessage("New Password", password, link);
    await this.sendMail({
      to,
      subject: "New Password",
      htmlOrText: html,
    });
  }

  // Order Confirmation Example
  public async sendOrderEmail(to: string, orderId: string) {
    const html = `
      <h2>Order Confirmed 🎉</h2>
      <p>Your order <b>#${orderId}</b> has been placed successfully.</p>
    `;
    await this.sendMail({
      to,
      subject: "Order Confirmation ✅",
      htmlOrText: html,
    });
  }
}

export const transporter = new EmailService();
