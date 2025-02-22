import { z } from "zod";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { H3Error } from "h3";

import { user as userTypes } from "@/constants/webhooks";

const client = jwksClient({
  jwksUri: `${process.env.KINDE_AUTH_DOMAIN}/.well-known/jwks.json`,
});

export default defineEventHandler(async (event) => {
  try {
    assertMethod(event, "POST");
    if (handleCors(event, { origin: "*" })) return;

    const contentType = getRequestHeader(event, "content-type");
    if (contentType !== "application/jwt")
      throw createError({
        statusCode: 400,
        statusMessage: "Not acceptable",
      });

    const token = await readRawBody(event);
    console.log(token);
    return null;
    // const decoded = jwt.decode(token, { complete: true });

    // if (!decoded)
    //   throw createError({ statusCode: 404, statusMessage: "Invalid token" });

    // const { kid } = decoded.header;
    // const key = await client.getSigningKey(kid);
    // const signingKey = key.getPublicKey();

    // const w = await jwt.verify(token, signingKey);

    // return { data: JSON.stringify(w) };

    // if (typeof w === "string")
    //   throw createError({
    //     statusCode: 404,
    //     statusMessage: "Invalid webhook type",
    //   });

    // switch (w?.type) {
    //   case userTypes.created:
    //     return { data: JSON.stringify(w) };

    //   default:
    //     return "Nothing to see here";
    //     break;
    // }
  } catch (error) {
    //Must throw webhook error
    console.log("WEBHOOK");
    if (error instanceof H3Error) console.log(error.stack);
  }
});
