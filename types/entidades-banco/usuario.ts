export type PerfilAcesso = "desenvolvedor" | "admin" | "viewer";

export const PERFIS_ACESSO = [
  { valor: "desenvolvedor", label: "Desenvolvedor (Acesso Sistema)" },
  { valor: "admin", label: "Administrador (Acesso Total)" },
  { valor: "viewer", label: "Visualizador (Apenas Leitura)" },
] as const;

export const PERFIS_GERENCIAVEIS = PERFIS_ACESSO.filter(
  (p) => p.valor !== "desenvolvedor",
);

export interface UsuarioForm {
  id: string;
  email: string;
  nome: string;
  perfil: PerfilAcesso;
  senha?: string;
}
