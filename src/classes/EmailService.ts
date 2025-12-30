import { transporterConfig } from "../configs";
import { EMAIL_FROM } from "../envs";

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
    text?: string;
    html?: string;
  }) {
    return this.transporter.sendMail({
      from: EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
  }

  // OTP Email Example
  public async sendOtpEmail(to: string, otp: string) {
    const html = `
      <h2>Your OTP is <b>${otp}</b></h2>
      <p>It will expire in 10 minutes.</p>
    `;
    await this.sendMail({ to, subject: "Your OTP Code 🔑", html });
  }

  // Order Confirmation Example
  public async sendOrderEmail(to: string, orderId: string) {
    const html = `
      <h2>Order Confirmed 🎉</h2>
      <p>Your order <b>#${orderId}</b> has been placed successfully.</p>
    `;
    await this.sendMail({ to, subject: "Order Confirmation ✅", html });
  }
}

export const transporter = new EmailService();
