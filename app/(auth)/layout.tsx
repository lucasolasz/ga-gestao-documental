import { Metadata } from "next";

export const metadata: Metadata = {
  title: "GA SOLUÇÕES - Login",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
