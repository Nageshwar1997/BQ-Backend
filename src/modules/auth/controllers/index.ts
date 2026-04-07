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
import {
  forgotPasswordSendLinkAndOtpController,
  forgotPasswordResendLinkAndOtpController,
  forgotPasswordVerifyOtpController,
  forgotPasswordValidateTokenController,
  forgotPasswordSetPasswordController,
} from "./password";
import {
  registerSendOtpController,
  registerResendOtpController,
  registerVerifyOtpController,
} from "./register";

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
