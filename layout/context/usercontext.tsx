"use client";
import { createContext, useContext } from "react";

export type UserData = {
  nome: string;
  email: string;
  perfil: string;
};

const UserContext = createContext<UserData>({ nome: "", email: "", perfil: "" });

export function UserProvider({
  children,
  user,
}: {
  children: React.ReactNode;
  user: UserData;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
