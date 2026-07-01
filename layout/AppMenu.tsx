/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import AppMenuitem from "./AppMenuitem";
import { MenuProvider } from "./context/menucontext";
import { AppMenuItem } from "@/types/layout";
import { useUser } from "@/layout/context/usercontext";

const AppMenu = () => {
  const { perfil } = useUser();

  const model: AppMenuItem[] = [
    {
      label: "Home",
      items: [{ label: "Dashboard", icon: "pi pi-fw pi-home", to: "/" }],
    },
    {
      label: "Cadastro",
      items: [
        {
          label: "Clientes",
          icon: "pi pi-fw pi-id-card",
          to: "/clientes",
        },
        {
          label: "Categorias",
          icon: "pi pi-fw pi-check-square",
          to: "/categorias",
        },
        {
          label: "Tipos de Documentos",
          icon: "pi pi-fw pi-file",
          to: "/tipodocumento",
        },
        {
          label: "Famílias de Documentos",
          icon: "pi pi-fw pi-sitemap",
          to: "/familias",
        },
      ],
    },
    {
      label: "Administrativo",
      items: [
        ...(perfil !== "viewer"
          ? [{ label: "Usuários", icon: "pi pi-fw pi-users", to: "/usuarios" }]
          : []),
      ],
    },
  ];

  return (
    <MenuProvider>
      <ul className="layout-menu">
        {model.map((item, i) => {
          return !item?.seperator ? (
            <AppMenuitem item={item} root={true} index={i} key={item.label} />
          ) : (
            <li className="menu-separator"></li>
          );
        })}

        <Link
          href="https://blocks.primereact.org"
          target="_blank"
          style={{ cursor: "pointer" }}
        ></Link>
      </ul>
    </MenuProvider>
  );
};

export default AppMenu;
