import Image from "next/image";
import Link from "next/link";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex flex-col gap-3 min-h-screen items-center justify-center px-4">
      <Link
        href="/"
        className="flex w-full max-w-sum gap-4 justify-center items-center text-2xl font-bold"
      >
        <Image src="/logos/logo.svg" alt="Logo" width={30} height={30} />
        FlowForge
      </Link>
      {children}
    </main>
  );
};

export default AuthLayout;
