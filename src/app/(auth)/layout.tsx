import AuthLayout from "../features/auth/auth-layout";
import { ReactNode } from "react";
const layout = ({ children }: { children: ReactNode }) => {
  return <AuthLayout>{children}</AuthLayout>;
};

export default layout;
