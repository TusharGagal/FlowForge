import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient();

export const signInGoogle = async () => {
  try {
    return await authClient.signIn.social({
      provider: "google",
    });
  } catch (error) {
    console.log("Google sign in failed:", error);
    throw error;
  }
};
export const signInGithub = async () => {
  try {
    return await authClient.signIn.social({
      provider: "github",
    });
  } catch (error) {
    console.log("Google sign in failed:", error);
    throw error;
  }
};
