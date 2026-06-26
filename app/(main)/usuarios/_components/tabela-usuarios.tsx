"use client";

import { useWatch } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { classNames } from "primereact/utils";

import TabelaGenerica from "@/components/tabelaGenerica";
import CrudDialog from "@/components/crudDialog";
import ConfirmarExclusaoDialog from "@/components/confirmarExclusaoDialog";
import { useCrud } from "@/hooks/useCrud";
import { UsuarioForm, PERFIS_ACESSO } from "@/types/entidades-banco/usuario";
import {
  pesquisarUsuarios,
  criarUsuario,
  atualizarUsuario,
  deletarUsuario as deletarUsuarioService,
} from "@/services/usuario-service";

interface TabelaUsuariosProps {
  titulo: string;
}

const usuarioVazio: UsuarioForm = {
  id: "",
  email: "",
  nome: "",
  perfil: "viewer",
  senha: "",
};

export default function TabelaUsuarios({ titulo }: TabelaUsuariosProps) {
  const {
    items: usuarios,
    control,
    handleSubmit,
    errors,
    itemSelecionado,
    salvando,
    deletando,
    dialogAberto,
    dialogDeletar,
    setDialogDeletar,
    toast,
    abrirNovo,
    fechar,
    colunaAcoes,
    salvar,
    deletar,
  } = useCrud<UsuarioForm>(usuarioVazio, pesquisarUsuarios);

  const id = useWatch({ control, name: "id" });
  const isEdicao = !!id;

  const labelPerfil = (valor: string) =>
    PERFIS_ACESSO.find((p) => p.valor === valor)?.label ?? valor;

  return (
    <>
      <Toast ref={toast} />

      <TabelaGenerica
        value={usuarios}
        titulo={titulo}
        headerActions={
          <Button label="Novo" icon="pi pi-plus" severity="success" onClick={abrirNovo} />
        }
        columns={[
          { field: "nome", header: "Nome", sortable: true },
          { field: "email", header: "E-mail", sortable: true },
          {
            field: "perfil",
            header: "Perfil",
            sortable: true,
            body: (row: UsuarioForm) => labelPerfil(row.perfil),
          },
          {
            header: "Ações",
            body: colunaAcoes,
            exportable: false,
            style: { minWidth: "12rem" },
          },
        ]}
      />

      <CrudDialog
        visible={dialogAberto}
        titulo={isEdicao ? "Editar Usuário" : "Novo Usuário"}
        onHide={fechar}
        onSalvar={handleSubmit((data) =>
          salvar(data, {
            criarFn: criarUsuario,
            atualizarFn: atualizarUsuario,
            mensagens: {
              criado: "Usuário Criado",
              atualizado: "Usuário Atualizado",
            },
          }),
        )}
        salvando={salvando}
      >
        <div className="field mb-3">
          <label htmlFor="nome" className="font-bold">
            Nome
          </label>
          <Controller
            name="nome"
            control={control}
            rules={{ required: "Nome é obrigatório" }}
            render={({ field }) => (
              <>
                <InputText
                  id="nome"
                  {...field}
                  autoFocus
                  className={classNames({ "p-invalid": errors.nome })}
                />
                {errors.nome && <small className="p-error">{errors.nome.message}</small>}
              </>
            )}
          />
        </div>

        <div className="field mb-3">
          <label htmlFor="email" className="font-bold">
            E-mail
          </label>
          <Controller
            name="email"
            control={control}
            rules={{
              required: "E-mail é obrigatório",
              pattern: { value: /\S+@\S+\.\S+/, message: "E-mail inválido" },
            }}
            render={({ field }) => (
              <>
                <InputText
                  id="email"
                  {...field}
                  className={classNames({ "p-invalid": errors.email })}
                />
                {errors.email && <small className="p-error">{errors.email.message}</small>}
              </>
            )}
          />
        </div>

        <div className="field mb-3">
          <label htmlFor="senha" className="font-bold">
            Senha {isEdicao && <span className="font-normal text-color-secondary">(deixe em branco para manter)</span>}
          </label>
          <Controller
            name="senha"
            control={control}
            rules={{ required: isEdicao ? false : "Senha é obrigatória" }}
            render={({ field }) => (
              <>
                <Password
                  id="senha"
                  {...field}
                  value={field.value ?? ""}
                  feedback={false}
                  toggleMask
                  className={classNames({ "p-invalid": errors.senha })}
                />
                {errors.senha && <small className="p-error">{errors.senha.message}</small>}
              </>
            )}
          />
        </div>

        <div className="field mb-3">
          <label htmlFor="perfil" className="font-bold">
            Perfil de Acesso
          </label>
          <Controller
            name="perfil"
            control={control}
            rules={{ required: "Perfil é obrigatório" }}
            render={({ field }) => (
              <>
                <Dropdown
                  id="perfil"
                  {...field}
                  options={[...PERFIS_ACESSO]}
                  optionLabel="label"
                  optionValue="valor"
                  placeholder="Selecione um perfil"
                  className={classNames({ "p-invalid": errors.perfil })}
                />
                {errors.perfil && <small className="p-error">{errors.perfil.message}</small>}
              </>
            )}
          />
        </div>
      </CrudDialog>

      <ConfirmarExclusaoDialog
        visible={dialogDeletar}
        onHide={() => setDialogDeletar(false)}
        onConfirmar={() =>
          deletar({
            deletarFn: deletarUsuarioService,
            mensagem: "Usuário Excluído",
          })
        }
        deletando={deletando}
        descricao={
          <span>
            Tem certeza que deseja excluir o usuário <b>{itemSelecionado.nome}</b>?
          </span>
        }
      />
    </>
  );
}
