import axios, { AxiosError } from "axios";
import {
  IS_DEV,
  MAIL_SERVICE_DEVELOPMENT_BASE_URL,
  MAIL_SERVICE_PRODUCTION_BASE_URL,
} from "../envs";

class MailService {
  private baseUrl =
    IS_DEV === "true"
      ? MAIL_SERVICE_DEVELOPMENT_BASE_URL
      : MAIL_SERVICE_PRODUCTION_BASE_URL;
  private getErrorMessage(error: unknown, defaultMsg = "Something went wrong") {
    const message =
      error instanceof AxiosError
        ? error.message || error.response?.data?.message
        : error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : defaultMsg;

    return message;
  }

  public async checkConnection() {
    try {
      await axios.get(`${this.baseUrl}/verify-connection`);
      console.log("📪 Email server ready");
    } catch (err) {
      console.error("❌ Email server connection failed", err);
    }
  }

  // OTP Email
  public async sendOtp({ to, otp }: Record<"to" | "otp", string>) {
    try {
      const { data } = await axios.post(`${this.baseUrl}/send-otp`, {
        to,
        otp,
      });
      return {
        success: data?.success || true,
        message: data?.message || "OTP sent successfully",
      };
    } catch (error) {
      const message = this.getErrorMessage(error, "Failed to send OTP");
      console.log("❌ Failed to send OTP", error);
      return { success: false, message };
    }
  }

  // Password Reset Link Email
  public async sendPasswordResetLink({
    to,
    resetLink,
  }: Record<"to" | "resetLink", string>) {
    try {
      const { data } = await axios.post(
        `${this.baseUrl}/send-password-reset-link`,
        { to, link: resetLink }
      );
      return {
        success: data?.success || true,
        message: data?.message || "Password reset link sent on your email",
      };
    } catch (error) {
      const message = this.getErrorMessage(
        error,
        "Failed to send password reset link"
      );
      console.log("❌ Failed to send password reset link", error);
      return { success: false, message };
    }
  }

  // Forgot Password Link Email
  public async sendForgotPasswordLink({
    to,
    link,
  }: Record<"to" | "link", string>) {
    try {
      const { data } = await axios.post(
        `${this.baseUrl}/send-forgot-password-link`,
        { to, link }
      );
      return {
        success: data?.success || true,
        message: data?.message || "Forgot password link sent on your email",
      };
    } catch (error) {
      const message = this.getErrorMessage(
        error,
        "Failed to send forgot password link"
      );
      console.log("❌ Failed to send forgot password link", error);
      return { success: false, message };
    }
  }
}

export const mailService = new MailService();
