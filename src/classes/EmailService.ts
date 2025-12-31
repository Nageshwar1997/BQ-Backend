import { convert } from "html-to-text";
import { transporterConfig } from "../configs";
import { EMAIL_FROM } from "../envs";
import { getOtpHtmlMessage } from "../utils";

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
      from: EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      text,
      html: options.htmlOrText,
    });
  }

  // OTP Email Example
  public async sendOtpEmail(to: string, otp: string) {
    const html = getOtpHtmlMessage("OTP Verification", otp);
    await this.sendMail({ to, subject: "Your OTP Code 🔑", htmlOrText: html });
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
