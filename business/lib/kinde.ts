import {
  createKindeServerClient,
  GrantType,
} from "@kinde-oss/kinde-typescript-sdk";

// Client for authorization code flow
export const kindeClient = createKindeServerClient(
  GrantType.AUTHORIZATION_CODE,
  {
    authDomain: process.env.KINDE_AUTH_DOMAIN || "",
    clientId: process.env.KINDE_CLIENT_ID || "",
    clientSecret: process.env.KINDE_CLIENT_SECRET || "",
    redirectURL: process.env.KINDE_REDIRECT_URL || "",
    logoutRedirectURL: process.env.KINDE_LOGOUT_URL || "",
  }
);

// Client for client credentials flow
export const kindeApiClient = createKindeServerClient(
  GrantType.CLIENT_CREDENTIALS,
  {
    authDomain: process.env.KINDE_AUTH_DOMAIN || "",
    clientId: process.env.KINDE_CLIENT_ID || "",
    clientSecret: process.env.KINDE_CLIENT_SECRET || "",
    logoutRedirectURL: process.env.KINDE_LOGOUT_URL || "",
  }
);
