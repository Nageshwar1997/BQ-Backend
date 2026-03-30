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

export * from "./register";
export * from "./password";

export const AuthControllers = {
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
};
