import { google } from "googleapis";
import axios from "axios";
import { ParsedQs } from "qs";
import {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  LINKEDIN_CLIENT_ID,
  LINKEDIN_CLIENT_SECRET,
} from "../../envs";
import { getSocialAuthRedirectURL } from "../../utils";

export const googleAuthConfig = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  getSocialAuthRedirectURL("GOOGLE")
);

export const googleAuthClient = {
  url: googleAuthConfig.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    prompt: "consent",
    redirect_uri: getSocialAuthRedirectURL("GOOGLE"),
  }),

  decode: async (code: string | ParsedQs | (string | ParsedQs)[]) => {
    const { tokens } = await googleAuthConfig.getToken(code.toString());

    googleAuthConfig.setCredentials(tokens);

    const { data } = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    );

    return data;
  },
};

export const linkedinAuthClient = {
  url: `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    getSocialAuthRedirectURL("LINKEDIN")
  )}&scope=openid%20profile%20email`,
  token_response: async (code: string | ParsedQs | (string | ParsedQs)[]) => {
    const { data } = await axios.post(
      `https://www.linkedin.com/oauth/v2/accessToken`,
      null,
      {
        params: {
          grant_type: "authorization_code",
          code,
          redirect_uri: getSocialAuthRedirectURL("LINKEDIN"),
          client_id: LINKEDIN_CLIENT_ID,
          client_secret: LINKEDIN_CLIENT_SECRET,
        },
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    return data;
  },
  decode: (id_token: string) => {
    const base64Payload = id_token.split(".")[1];
    const decoded = JSON.parse(Buffer.from(base64Payload, "base64").toString());

    return decoded;
  },
};

export const githubAuthClient = {
  url: `https://github.com/login/oauth/authorize?${new URLSearchParams({
    client_id: GITHUB_CLIENT_ID!,
    redirect_uri: getSocialAuthRedirectURL("GITHUB"),
    scope: "read:user user:email",
    allow_signup: "true",
  }).toString()}`,
  token_response: async (code: string | ParsedQs | (string | ParsedQs)[]) => {
    const { data } = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: getSocialAuthRedirectURL("GITHUB"),
      },
      { headers: { Accept: "application/json" } }
    );

    return data;
  },
  decode: async (access_token: string) => {
    const headers = { Authorization: `Bearer ${access_token}` };

    const { data } = await axios.get("https://api.github.com/user", {
      headers,
    });

    const profile = data;

    if (!profile.email) {
      const { data: emails } = await axios.get(
        "https://api.github.com/user/emails",
        { headers }
      );

      const email =
        emails.find((email: Record<string, string | boolean>) => email.primary)
          ?.email || emails[0]?.email;
      profile.email = email || "";
    }

    return profile;
  },
};
