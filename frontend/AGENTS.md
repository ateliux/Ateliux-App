<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — Regras Para Agentes de IA no Projeto Ateliux

## 1. Função deste arquivo

Este arquivo orienta qualquer agente de IA que trabalhe no frontend da Ateliux.

O agente deve ler este arquivo e `CLAUDE.md` antes de modificar qualquer código. A regra específica do Next.js no início deste arquivo deve ser sempre preservada.

## 2. Regra principal

Preservar a estrutura existente do projeto.

Não redesenhar, reescrever ou reorganizar grandes partes sem solicitação explícita. Primeiro entender o código atual, depois realizar a menor alteração coerente que resolva o pedido.

## 3. O que o agente NÃO deve fazer

- Não criar backend sem pedido explícito.
- Não criar admin sem pedido explícito.
- Não implementar autenticação real sem pedido explícito.
- Não proteger rotas sem pedido explícito.
- Não trocar a stack do projeto.
- Não instalar dependências sem necessidade confirmada.
- Não redesenhar páginas aprovadas.
- Não apagar componentes sem verificar seu uso.
- Não mover arquivos em massa sem justificativa.
- Não transformar tudo em Client Component.
- Não deixar grandes volumes de dados hardcoded dentro de componentes.
- Não usar `any` sem necessidade.
- Não usar classes Tailwind dinâmicas que o build não detecta.
- Não criar rotas fora do padrão do App Router.
- Não deixar `href="#"` em CTAs importantes.
- Não afirmar que formulários, login ou CRM são funcionais quando ainda forem mockados.
- Não misturar o visual público com o visual CRM sem motivo.
- Não sobrescrever ou reverter alterações existentes do usuário sem autorização.

## 4. Como o agente deve trabalhar

- Analisar a estrutura antes de alterar.
- Identificar todos os arquivos envolvidos.
- Verificar mudanças existentes no Git antes de editar.
- Fazer alterações pequenas e controladas.
- Preservar o design aprovado.
- Criar componentes quando houver necessidade ou reutilização real.
- Manter conteúdo editorial em `content/`.
- Manter dados e mocks em `data/`.
- Manter tipos compartilhados em `types/`.
- Usar `Link` do Next.js para navegação interna.
- Usar `next/image` quando apropriado.
- Manter acessibilidade mínima.
- Validar lint, TypeScript e build quando possível.

## 5. Padrão de estrutura

- Rotas em `app/`.
- Componentes em `components/<dominio>/`.
- Conteúdo textual em `content/<dominio>/`.
- Dados e navegação em `data/`.
- Tipos em `types/`.
- UI compartilhada em `components/ui/`.
- Portal do Cliente em `components/client-portal/`, `data/client-portal/`, `types/client-portal.ts` e rotas `app/cliente/`.
- `components/crm/` e `app/crm/` são estrutura legada em migração e não devem receber novos módulos de produto.

Não criar abstrações ou pastas novas sem necessidade clara.

## 6. Regras para páginas públicas

- Manter o visual clean, branco, espaçoso e corporativo.
- Preservar Header e Footer.
- Manter CTAs coerentes e direcionar CTAs comerciais para `/contato`.
- Não quebrar responsividade.
- Não remover metadata de SEO.
- Reutilizar a logo global da Ateliux.
- Manter botões principais no padrão visual preto do projeto.

## 7. Regras para blog

- Manter o tema dark.
- Preservar cards e estrutura editorial.
- Garantir que posts tenham slug.
- Fazer cards apontarem para `/blog/[slug]`.
- Manter conteúdo editorial em `content/blog`.
- Preservar o visual de leitura dos artigos.
- Não alterar a estilização aprovada dos cards sem pedido explícito.

## 8. Regras para use cases

- Preservar categorias e módulos.
- Preservar deep linking, se existir.
- Usar artigos do blog quando esse padrão já estiver implementado.
- Fazer a leitura de módulo substituir apenas a área dos módulos.
- Manter navegação e botões alinhados ao padrão visual do projeto.

## 9. Regras para contato e preços

Ao mexer em `/precos`:

- botões dos planos devem levar para `/contato`;
- query params de plano ou assunto devem ser preservados;
- botões devem seguir o padrão visual global.

Ao mexer em `/contato`:

- não fingir envio real sem integração;
- deixar tecnicamente claro quando o formulário for apenas visual;
- usar `name`, label e validação quando necessário;
- preservar valores recebidos por query params;
- manter a identidade global da Ateliux.

## 10. Regras para autenticação

Atualmente, `/login` e `/criar-conta` são visuais.

O agente não deve criar autenticação falsa, criar sessão fake, proteger rotas parcialmente ou redirecionar o usuário para o Portal do Cliente como se o login funcionasse sem pedido explícito.

Quando a autenticação for implementada, a decisão deve incluir provider, sessão, middleware, backend e regras de autorização claramente definidas.

## 11. Regras para o Portal do Cliente

- Manter o Portal do Cliente em `/cliente` e suas subrotas organizadas.
- Tratar `/crm` somente como compatibilidade temporária.
- Preservar o layout com sidebar e topbar.
- Não exibir Header ou Footer público dentro do Portal do Cliente.
- Manter dados mockados em `data/client-portal` enquanto não houver backend.
- Não tratar mocks como produção ou criar persistência falsa.
- Não mudar o design sem solicitação.
- Usar a logo global da Ateliux.
- Manter o tema claro com identidade preta, branca e cinza.
- Reservar verde, amarelo e vermelho principalmente para estados semânticos.
- Não transformar o portal em CRM genérico ou ferramenta SaaS aberta.
- O portal deve mostrar apenas informações necessárias para o cliente acompanhar projetos contratados com a Ateliux.

## 12. Regras de acessibilidade

- Usar `aria-label` em botões de ícone.
- Usar `alt` descritivo em imagens.
- Manter labels em inputs.
- Preservar foco visível e contraste mínimo.
- Garantir navegação por teclado.
- Criar modais com fechamento acessível.
- Respeitar `prefers-reduced-motion` quando usar animações.

## 13. Regras para Framer Motion

- Criar wrappers reutilizáveis quando houver repetição real.
- Não transformar páginas inteiras em Client Component sem necessidade.
- Não exagerar nas animações.
- Usar movimento suave e profissional.
- Respeitar redução de movimento.
- Evitar animações que deixem conteúdo invisível sem JavaScript.

## 14. Regras de dados mockados

Dados mockados devem ficar em `data/`, ser nomeados claramente, não simular produção, não ser tratados como persistentes, ser substituíveis por APIs e possuir tipos claros quando compartilhados.

## 15. Regras de TypeScript

- Evitar `any`.
- Criar tipos claros.
- Usar unions para status e variantes.
- Evitar casts desnecessários.
- Tipar props dos componentes.
- Garantir que `npx tsc --noEmit` passe.

## 16. Regras de Tailwind

- Evitar classes dinâmicas como `bg-${color}-500`.
- Usar mapas fixos de classes.
- Preservar padrões visuais existentes.
- Evitar repetição excessiva quando houver componente compartilhado adequado.
- Não trocar a paleta sem pedido explícito.
- Evitar overflow horizontal grave.

## 17. Validação obrigatória

Após alterações relevantes, executar:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Quando relevante, também validar rotas e interações no navegador.

Se algum comando falhar, informar arquivo, erro, provável causa e correção realizada ou sugerida. Mudanças exclusivamente documentais não exigem build, mas os arquivos criados devem ser conferidos.

## 18. Resumo final obrigatório

Ao finalizar uma tarefa, retornar arquivos alterados e criados, o que foi feito, o que não foi feito, pendências, comandos executados e erros encontrados.

O resumo deve ser direto e proporcional à tarefa.

## 19. Prioridade de trabalho

1. Não quebrar o projeto.
2. Preservar o design aprovado.
3. Manter a estrutura organizada.
4. Melhorar o código sem exagero.
5. Validar TypeScript, lint e build.
6. Documentar pendências.

## 20. Regra final

Se houver dúvida sobre arquitetura, autenticação, backend, admin, CRM real ou mudanças grandes, o agente deve parar e pedir confirmação antes de implementar.
