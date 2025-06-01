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
}
