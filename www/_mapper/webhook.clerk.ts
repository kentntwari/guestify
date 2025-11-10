import type { User } from "@clerk/react-router/ssr.server";

import { UserEntity } from "_entities/user";

import { BaseMapper } from "./_base";

type TCreateUserDTO = {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    imageUrl: string;
  };
};

export class WebhookClerkMapper extends BaseMapper {
  static toCreateUser(user: UserEntity): TCreateUserDTO {
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

  static toUpdateUserMetadata(
    userMetadata: Pick<
      NonNullable<User["raw"]>,
      "private_metadata" | "public_metadata" | "unsafe_metadata"
    >
  ) {
    return {
      private_metadata: userMetadata.private_metadata,
      public_metadata: userMetadata.public_metadata,
      unsafe_metadata: userMetadata.unsafe_metadata,
    } satisfies Parameters<typeof this.toUpdateUserMetadata>[0];
  }
}
