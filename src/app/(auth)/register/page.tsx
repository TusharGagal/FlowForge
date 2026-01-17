import React from "react";
import RegisterForm from "@/app/features/auth/components/register-form";
import { requireUnAuth } from "@/lib/auth-utils";

const RegisterPage = async () => {
  await requireUnAuth();
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <RegisterForm />
    </main>
  );
};

export default RegisterPage;

//  https://localhost:3000/login
