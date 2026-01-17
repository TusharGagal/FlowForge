import React from "react";
import LoginForm from "@/app/features/auth/components/login-form";
import { requireUnAuth } from "@/lib/auth-utils";
const LoginPage = async () => {
  await requireUnAuth();
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <LoginForm />
    </main>
  );
};

export default LoginPage;

//  https://localhost:3000/login
