import { z } from "zod";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

import { user as userTypes } from "@/constants/webhooks";

const client = jwksClient({
  jwksUri: `${process.env.KINDE_AUTH_DOMAIN}/.well-known/jwks.json`,
});

export default defineEventHandler(async (event) => {
  try {
    // assertMethod(event, "POST");
    if (handleCors(event, { origin: "*" })) return;

    const contentType = getRequestHeader(event, "content-type");
    if (contentType !== "application/jwt")
      throw createError({
        statusCode: 400,
        statusMessage: "Not acceptable",
      });

    const token = await readValidatedBody(event, (body) =>
      typeof body !== "string" ? z.coerce.string().parse(body) : body
    );
    const decoded = jwt.decode(token, { complete: true });

    if (!decoded)
      throw createError({ statusCode: 404, statusMessage: "Invalid token" });

    const { kid } = decoded.header;
    const key = await client.getSigningKey(kid);
    const signingKey = key.getPublicKey();

    const w = await jwt.verify(token, signingKey);

    if (typeof w === "string")
      throw createError({
        statusCode: 404,
        statusMessage: "Invalid webhook type",
      });

    switch (w?.type) {
      case userTypes.created:
        console.log(w.data);
        break;

      default:
        break;
    }
  } catch (error) {
    //Must throw webhook error
    console.log(error);
  }
});
