/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import AppMenuitem from "./AppMenuitem";
import { MenuProvider } from "./context/menucontext";
import { AppMenuItem } from "@/types/layout";

const AppMenu = () => {
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
      ],
    },
    {
      label: "Administrativo",
      items: [
        {
          label: "Usuários",
          icon: "pi pi-fw pi-users",
          to: "/usuarios",
        },
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
