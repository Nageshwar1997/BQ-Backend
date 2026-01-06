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

  // Password New Password Email
  public async sendNewPassword({
    to,
    loginLink,
    password,
  }: Record<"to" | "loginLink" | "password", string>) {
    try {
      const { data } = await axios.post(`${this.baseUrl}/send-new-password`, {
        to,
        link: loginLink,
        password,
      });
      return {
        success: data?.success || true,
        message: data?.message || "New password sent on your email",
      };
    } catch (error) {
      const message = this.getErrorMessage(
        error,
        "Failed to send new password"
      );
      console.log("❌ Failed to send new password", error);
      return { success: false, message };
    }
  }
}

export const mailService = new MailService();
