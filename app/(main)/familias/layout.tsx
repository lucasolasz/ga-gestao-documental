import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Famílias de Documentos",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
