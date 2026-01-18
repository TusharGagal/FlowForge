import React from "react";
import RegisterForm from "@/app/features/auth/components/register-form";
import { requireUnAuth } from "@/lib/auth-utils";

const RegisterPage = async () => {
  await requireUnAuth();
  return <RegisterForm />;
};

export default RegisterPage;

//  https://localhost:3000/login
