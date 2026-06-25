/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { classNames } from "primereact/utils";
import { forwardRef, useContext, useImperativeHandle, useRef } from "react";
import { LayoutContext } from "./context/layoutcontext";
import Image from "next/image";
import { AppTopbarRef } from "@/types/layout";
import { Menu } from "primereact/menu";
import { logout } from "@/app/(auth)/login/auth/actions";
import { useUser } from "./context/usercontext";

const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
  const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar } =
    useContext(LayoutContext);
  const menubuttonRef = useRef(null);
  const topbarmenuRef = useRef(null);
  const topbarmenubuttonRef = useRef(null);
  const menuRef = useRef<Menu>(null);
  const { nome, email } = useUser();
  const displayName = nome || email;

  useImperativeHandle(ref, () => ({
    menubutton: menubuttonRef.current,
    topbarmenu: topbarmenuRef.current,
    topbarmenubutton: topbarmenubuttonRef.current,
  }));

  const menuItems = [
    {
      label: "Sair",
      icon: "pi pi-sign-out",
      command: () => logout(),
    },
  ];

  return (
    <div className="layout-topbar">
      <Link href="/" className="layout-topbar-logo">
        <Image
          src="/assets/image_login.jpg"
          alt="Logo"
          width={35}
          height={35}
          priority
          className="mr-2"
        />
        <span className="text-xl font-small ml-2">
          GA Soluções Empresariais
        </span>
      </Link>

      <button
        ref={menubuttonRef}
        type="button"
        className="p-link layout-menu-button layout-topbar-button"
        onClick={onMenuToggle}
      >
        <i className="pi pi-bars" />
      </button>

      <button
        ref={topbarmenubuttonRef}
        type="button"
        className="p-link layout-topbar-menu-button layout-topbar-button"
        onClick={showProfileSidebar}
      >
        <i className="pi pi-ellipsis-v" />
      </button>

      <Menu ref={menuRef} model={menuItems} popup />
      <div
        ref={topbarmenuRef}
        className={classNames("layout-topbar-menu", {
          "layout-topbar-menu-mobile-active": layoutState.profileSidebarVisible,
        })}
      >
        <button
          type="button"
          className="p-link layout-topbar-button layout-topbar-profile-button"
          onClick={(e) => menuRef.current?.toggle(e)}
        >
          <i className="pi pi-user"></i>
          <span>{displayName}</span>
        </button>
      </div>
    </div>
  );
});

AppTopbar.displayName = "AppTopbar";

export default AppTopbar;
