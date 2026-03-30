import {
  githubCallbackController,
  githubRedirectController,
  googleCallbackController,
  googleRedirectController,
  linkedinCallbackController,
  linkedinRedirectController,
  logoutController,
  manualLoginController,
} from "./login";
import { forgotPasswordResendLinkAndOtpController, forgotPasswordSendLinkAndOtpController, forgotPasswordSetPasswordController, forgotPasswordValidateTokenController, forgotPasswordVerifyOtpController } from "./password";
import {
  registerResendOtpController,
  registerSendOtpController,
  registerVerifyOtpController,
} from "./register";

export * from "./password";

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
