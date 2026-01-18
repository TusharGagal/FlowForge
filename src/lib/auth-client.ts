import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient();

export const signInGoogle = async () => {
  await authClient.signIn.social({
    provider: "google",
  });
};
export const signInGithub = async () => {
  await authClient.signIn.social({
    provider: "github",
  });
};
