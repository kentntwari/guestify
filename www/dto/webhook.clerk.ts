import type { User } from "@clerk/react-router/ssr.server";
import type { UserEntity } from "entities/user";

export class WebhookClerkDTO {
  static createNewUserQuery(user: UserEntity) {
    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.emailAddress,
        imageUrl: user.imageUrl,
      },
    };
  }

  static updateUserMetadata(
    userMetadata: Pick<
      NonNullable<User["raw"]>,
      "private_metadata" | "public_metadata" | "unsafe_metadata"
    >
  ) {
    return {
      private_metadata: userMetadata.private_metadata,
      public_metadata: userMetadata.public_metadata,
      unsafe_metadata: userMetadata.unsafe_metadata,
    } satisfies Parameters<typeof this.updateUserMetadata>[0];
  }
}
