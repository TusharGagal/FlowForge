import React from "react";
import LoginForm from "@/app/features/auth/components/login-form";
import { requireUnAuth } from "@/lib/auth-utils";

const LoginPage = async () => {
  await requireUnAuth();
  return <LoginForm />;
};

export default LoginPage;

//  https://localhost:3000/login
