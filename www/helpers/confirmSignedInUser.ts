import { getAuth, clerkClient, type User } from "@clerk/react-router/server";

export type TConfirmRemixSignedInUser = {
  isSignedIn: boolean;
  userId: string | undefined;
  sessionId: string | undefined;
  data: Omit<User, "id"> | null;
};

// TODO: Implement custom error handling
export async function handleRemixSignedInUser(
  ...authParams: Parameters<typeof getAuth>
): Promise<TConfirmRemixSignedInUser> {
  try {
    const [remixLoaderArgs] = authParams;
    const { userId, sessionId, isAuthenticated } =
      await getAuth(remixLoaderArgs);

    if (!isAuthenticated || !userId)
      return {
        isSignedIn: false,
        userId: undefined,
        sessionId: undefined,
        data: null,
      };

    const user = await clerkClient(remixLoaderArgs).users.getUser(userId);

    return { isSignedIn: true, userId, sessionId, data: user };
  } catch (error) {
    console.error("Error confirming signed-in user:", error);
    return {
      isSignedIn: false,
      userId: undefined,
      sessionId: undefined,
      data: null,
    };
  }
}
