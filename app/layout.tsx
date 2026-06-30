"use client";
import { LayoutProvider } from "@/layout/context/layoutcontext";
import "primeflex/primeflex.css";
import "primeicons/primeicons.css";
import { PrimeReactProvider, addLocale } from "primereact/api";
import "primereact/resources/primereact.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "../styles/demo/Demos.scss";
import "../styles/layout/layout.scss";
import ptBR from "primelocale/pt-BR.json";

addLocale("pt-BR", ptBR["pt-BR"]);

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <PrimeReactProvider value={{ locale: "pt-BR" }}>
          <LayoutProvider>{children}</LayoutProvider>
        </PrimeReactProvider>
      </body>
    </html>
  );
}
