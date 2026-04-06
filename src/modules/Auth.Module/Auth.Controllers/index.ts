import {
  githubCallbackController,
  githubRedirectController,
  googleCallbackController,
  googleRedirectController,
  linkedinCallbackController,
  linkedinRedirectController,
  logoutController,
  manualLoginController,
} from "./Login.Controller";
import { forgotPasswordResendLinkAndOtpController, forgotPasswordSendLinkAndOtpController, forgotPasswordSetPasswordController, forgotPasswordValidateTokenController, forgotPasswordVerifyOtpController } from "./Password.Controller";
import {
  registerResendOtpController,
  registerSendOtpController,
  registerVerifyOtpController,
} from "./Register.Controller";

export * from "./Password.Controller";

export const authControllers = {
  login: {
    manual: manualLoginController,
    google: {
      redirect: googleRedirectController,
      callback: googleCallbackController,
    },
    linkedin: {
      redirect: linkedinRedirectController,
      callback: linkedinCallbackController,
    },
    github: {
      redirect: githubRedirectController,
      callback: githubCallbackController,
    },
  },
  logout: logoutController,
  register: {
    sendOtp: registerSendOtpController,
    resendOtp: registerResendOtpController,
    verifyOtp: registerVerifyOtpController,
  },
  password: {
    forgotPassword: {
      sendLinkAndOtp: forgotPasswordSendLinkAndOtpController,
      resendLinkAndOtp: forgotPasswordResendLinkAndOtpController,
      verifyOtp: forgotPasswordVerifyOtpController,
      validateToken: forgotPasswordValidateTokenController,
      setPassword: forgotPasswordSetPasswordController,
    },
  },
};
