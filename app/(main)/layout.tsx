import { Metadata, Viewport } from "next";
import { Suspense } from "react";
import Layout from "@/layout/layout";
import { createClient } from "@/lib/supabase/server";
import { UserProvider } from "@/layout/context/usercontext";

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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userData = { nome: "", email: user?.email ?? "", perfil: "" };

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("nome, perfil")
      .eq("id", user.id)
      .single();

    userData = {
      nome: profile?.nome ?? "",
      email: user?.email ?? "",
      perfil: profile?.perfil ?? "",
    };
  }

  return (
    <Suspense fallback={null}>
      <UserProvider user={userData}>
        <Layout>{children}</Layout>
      </UserProvider>
    </Suspense>
  );
}
