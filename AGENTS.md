## Sobre o Projeto

Sistema de gestão documental empresarial focado em **controle de validade de documentos**. Funcionalidades centrais: cadastro de documentos com datas de vencimento, alertas de expiração, categorização por tipo e cliente.

## Princípios de desenvolvimento

- **Clean code obrigatório**: sem duplicação, sem lógica desnecessária, nomes descritivos
- **Simplicidade**: preferir a solução mais simples que resolve o problema; programador deve operar sem dificuldade
- **Não duplicar**: antes de criar qualquer função, componente ou utilitário, verificar se já existe algo equivalente no projeto
- **Componentes UI**: usar exclusivamente **PrimeReact** para todos os componentes visuais (inputs, botões, tabelas, dialogs, toasts, etc.)
- **Next.js**: usar funcionalidades exclusivas do Next.js 16 sempre que aplicável (Server Components, Server Actions, Route Handlers, revalidatePath, cache, etc.)
- **Sem comentários óbvios**: só comentar o "porquê" quando não for evidente pelo código

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Padrão CRUD

Ao criar qualquer CRUD neste projeto, seguir este padrão obrigatório:

### Estrutura de arquivos
- `app/(main)/<entidade>/page.tsx` — shell mínima, sem fetch
- `app/(main)/<entidade>/_components/tabela-<entidade>.tsx` — componente auto-suficiente
- `app/api/<entidades>/route.ts` — GET + POST
- `app/api/<entidades>/[id]/route.ts` — PUT + DELETE
- `services/<entidade>-service.ts` — funções fetch client-side

### Hook useCrud
Sempre passar `fetchFn` como segundo argumento. O hook gerencia estado da lista, fetch inicial e re-fetch automático após mutações:
```ts
const { items, control, salvar, deletar, ... } = useCrud<Entidade>(entidadeVazia, pesquisarEntidades);
```

### Página — sempre shell mínima
```tsx
"use client";
import TabelaEntidade from "./_components/tabela-entidade";
export default function EntidadePage() {
  return <TabelaEntidade titulo="Entidades" />;
}
```

### Componente de tabela — auto-suficiente
- Não recebe dados via props (só `titulo: string`)
- Busca próprios dados via `useCrud` + `fetchFn`
- Usa `items` do hook como fonte da lista

### Referências de implementação existente
- Hook: `hooks/useCrud.tsx`
- Exemplo completo: `app/(main)/tipodocumento/_components/tabela-tipodocumento.tsx`
- Serviço modelo: `services/tipodocumento-service.ts`
- API modelo: `app/api/tipos-documentos/route.ts` e `app/api/tipos-documentos/[id]/route.ts`
