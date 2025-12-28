import { google } from "googleapis";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  LINKEDIN_CLIENT_ID,
  LINKEDIN_CLIENT_SECRET,
  LINKEDIN_REDIRECT_URI,
} from "../../envs";
import axios from "axios";
import QueryString from "qs";

export const googleAuthClient = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

export const linkedinAuthClient = {
  url: `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    LINKEDIN_REDIRECT_URI!
  )}&scope=openid%20profile%20email`,
  token_response: async (
    code: string | QueryString.ParsedQs | (string | QueryString.ParsedQs)[]
  ) => {
    const { data } = await axios.post(
      `https://www.linkedin.com/oauth/v2/accessToken`,
      null,
      {
        params: {
          grant_type: "authorization_code",
          code,
          redirect_uri: LINKEDIN_REDIRECT_URI,
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
