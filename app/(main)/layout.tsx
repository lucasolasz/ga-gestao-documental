import { Metadata, Viewport } from "next";
import { Suspense } from "react";
import Layout from "@/layout/layout";
import { getCurrentUser } from "@/lib/get-current-user";
import { UserProvider } from "@/layout/context/usercontext";
import IdleTimeoutGuard from "@/components/IdleTimeoutGuard";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: "GA SOLUÇÕES - Controle de Documentos",
  description: "Controle de validade de documentos para clientes",
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    title: "GA SOLUÇÕES - Controle de Documentos",
    url: "https://sakai.primereact.org/",
    description: "Controle de validade de documentos para clientes",
    images: ["https://www.primefaces.org/static/social/sakai-react.png"],
    ttl: 604800,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  initialScale: 1,
  width: "device-width",
};

export default async function AppLayout({ children }: AppLayoutProps) {
  const userData = await getCurrentUser();

  return (
    <Suspense fallback={null}>
      <UserProvider user={userData}>
        <Layout>{children}</Layout>
        <IdleTimeoutGuard />
      </UserProvider>
    </Suspense>
  );
}
