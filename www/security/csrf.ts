import crypto from "crypto";

interface IGenerateCSRFTokenResult {
  token: string | null | undefined;
  error:
    | { message: "unable to generate CSRF token"; reason: Error | string }
    | null
    | undefined;
}

export class CsrfTokenManager {
  private readonly SECRET_KEY: string;
  private readonly SESSION_ID: string;

  constructor(
    sessionId: string,
    secretKey: string = process.env.CSRF_SECRET_KEY || ""
  ) {
    this.SECRET_KEY = secretKey;
    this.SESSION_ID = sessionId;
  }

  public generateToken(): IGenerateCSRFTokenResult {
    const raw = crypto.randomBytes(32).toString("hex");
    const signed = crypto
      .createHmac("sha256", this.SECRET_KEY)
      .update(`${this.SESSION_ID}:${raw}`)
      .digest("hex");

    const token = `${raw}.${signed}`;

    return {
      token,
      error: null,
    };
  }

  public verifyToken(token: string): {
    isValid: boolean;
    error:
      | { message: "invalid CSRF token"; reason: Error | string }
      | null
      | undefined;
  } {
    try {
      const [raw, signed] = token.split(".");
      if (!raw || !signed) {
        return {
          isValid: false,
          error: { message: "invalid CSRF token", reason: "malformed token" },
        };
      }
      const verified = crypto
        .createHmac("sha256", this.SECRET_KEY)
        .update(`${this.SESSION_ID}:${raw}`)
        .digest("hex");

      // Use timingSafeEqual to prevent timing attacks
      const signedBuf = Buffer.from(signed, "hex");
      const verifiedBuf = Buffer.from(verified, "hex");

      if (
        signedBuf.length !== verifiedBuf.length ||
        !crypto.timingSafeEqual(signedBuf, verifiedBuf)
      ) {
        return {
          isValid: false,
          error: {
            message: "invalid CSRF token",
            reason: "signature mismatch",
          },
        };
      }

      return {
        isValid: true,
        error: null,
      };
    } catch (error) {
      return {
        isValid: false,
        error: { message: "invalid CSRF token", reason: error as Error },
      };
    }
  }
}
