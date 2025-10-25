# Plano de Modernização (UI/UX) — Removido

> Objetivo: deixar as telas **modernas e minimalistas**, padronizar componentes, corrigir erros visuais e melhorar usabilidade/acessibilidade. Este documento organiza tudo em **Markdown** para fácil execução.

---

## 1) Stack Recomendada

- **Next.js 15 (App Router)**
  - Remover do `next.config`: `swcMinify` e `future` (chaves obsoletas, origem do warning).
- **Tailwind CSS v4** com **design tokens** via CSS vars.
- **shadcn/ui** (sobre **Radix Primitives**) para componentes acessíveis e consistentes.
- **TanStack Query** para cache e estados de requisições.
- **TanStack Table** para tabelas headless (filtros, paginação, seleção em massa).
- **React Hook Form + Zod** para formulários, erros e validação.
- **date-fns** (pt-BR) para formatação de datas.
- **Motion** (Framer/Motion) para micro‑animações sutis.
- **Lucide** para ícones modernos.
- **Sonner** para sistema único de toasts (sucesso/erro/warn/info).

> **Acessibilidade**: contraste AA, navegação por teclado, foco visível; Radix já ajuda com ARIA.

---

## 2) Paleta de Cores (correção + tokens)

Você enviou: `#1AOB44, #003677, #0060AO, #008BBB, #OOB7CS, #OOEIC2` (contém letras inválidas: O/I/S). Correção sugerida (O→0, I→1, S→5):

- **Primária**: `#003677`  
- **Primária clara**: `#0060A0`  
- **Acento**: `#008BBB`  
- **Turquesa 1**: `#00B7C5`  
- **Turquesa 2**: `#00E1C2`  
- **Neutro escuro** (de `#1AOB44`): `#1A0B44`

> Se alguma conversão não for a pretendida, substitua pelo valor final desejado; mantenha contraste AA.

### 2.1 Design Tokens (Tailwind v4)

```css
@theme {
  /* Cores semânticas */
  --color-bg: oklch(0.98 0 0);
  --color-surface: oklch(0.97 0 0);
  --color-on-surface: oklch(0.28 0 0);

  --color-primary: #003677;
  --color-primary-contrast: #ffffff;
  --color-accent: #008BBB;
  --color-teal-1: #00B7C5;
  --color-teal-2: #00E1C2;
  --color-ink-900: #1A0B44;

  /* Estados */
  --color-success: #00B7C5;
  --color-warning: #F6C657;
  --color-danger:  #E5484D;

  /* Tokens globais */
  --radius: 14px;
  --shadow: 0 6px 24px rgba(0,0,0,.06);
}
```

**Tipografia:** Inter ou Manrope; base 14–16px; H1 28–32px; line‑height 1.4–1.6.

**Cards:** superfícies claras, `border-radius: var(--radius)`, `box-shadow: var(--shadow)`.

**Badges/Status:** componente único `StatusBadge` com mapeamento de cor:

- `aguardando` → `bg-[--color-warning]/10 text-[--color-warning]`
- `aprovado` → `bg-[--color-success]/10 text-[--color-success]`
- `finalizada` → `bg-[--color-ink-900]/10 text-[--color-ink-900]`

---

## 3) Diretrizes de UI (Modern + Minimal)

- Layout com **respiro** (padding 24–32px nas áreas principais).
- **Consistência** de espaçamentos (8/12/16/24/32) e de bordas (14px).
- **Skeleton** em carregamento e **Empty State** com CTA claro.
- **Toasts centralizados** (Sonner) e **ErrorBoundary** por rota.
- **Feedbacks** sempre responsivos: loading em botões, disabled states, mensagens objetivas.

---

## 4) Melhorias por Tela/Rota

### 4.1 `/home` (Dashboard)

**Diagnóstico**
- KPI cards com estilos e pesos diferentes; "Próxima lista" destoa.
- Tabela “Minhas listas” sem filtros/pesquisa, status pouco consistente.
- Callout de "Dica" muito largo; CTA de recarga discreto.

**Melhorias**
1) **Header de KPIs (3 cards uniformes):**
   - *Minhas listas enviadas*, *Total de nomes enviados*, *Próxima lista* (com contagem regressiva).
   - Ícones Lucide (Send, Users, Clock).
2) **Tabela unificada (TanStack Table):**
   - Colunas: **Origem**, **Valor**, **Criada em**, **Pessoas**, **Status**, **Ações**.
   - Busca por protocolo e filtro por status/data; sticky header; empty state.
3) **StatusBadge** padronizado conforme tokens.
4) **CTA “Recarregar dados”** com Motion (hover/tap) e loading state.
5) **Callout (Dica)** reduzido e dismissible logo abaixo da tabela.
6) **Formatos**: `Intl.NumberFormat('pt-BR')` e `date-fns` para datas.

**Critérios de Aceitação**
- 3 KPIs alinhados, mesmo layout e contrastes.
- Tabela permite ordenar, buscar e filtrar; estados de loading/empty visíveis.
- Status visual uniforme.
- Toast de sucesso/erro na recarga, com skeleton em loading.

---

### 4.2 `/dashboard/logistic/visualize` (Todas as listas)

**Diagnóstico**
- Barra de filtros longa; hierarquia fraca.
- Ação “Pagar listas” sem contexto de total selecionado.
- Tabela sem totalizador e sem paginação clara.
- Toast/erro "4 errors" isolado no rodapé.

**Melhorias**
1) **Toolbar de filtros compacta** (chips + dropdowns): Protocolo, Afiliado, Responsável, Status, com botão “Limpar”.
2) **Bulk actions sticky (rodapé da lista)** quando há seleção:
   - **X selecionados** • **Total R$** • **Pagar selecionadas** • **Exportar CSV**.
3) **Colunas** revisadas: Nº Protocolo (copiar on click), Data, Status (badge), Qtd Nomes (badge), Responsável (avatar), Ações.
4) **Toasts unificados (Sonner)** para erros/feedbacks de bulk actions.
5) **Paginação server-side** (10/25/50) e indicador de página.

**Critérios de Aceitação**
- Seleção múltipla mostra barra sticky com total somado e CTA de pagamento.
- Filtros persistem no URL (querystring) ao navegar/atualizar.
- Toasters padronizados; nenhum erro "solto" no layout.

---

### 4.3 `/dashboard/logistic/visualize/:protocol` (Editar Lista)

**Diagnóstico**
- Banner lilás fora da paleta; stepper pouco informativo.
- Card de pagamento grande, um único CTA e sem estados.

**Melhorias**
1) **Stepper de status (3 etapas)**
   - `Criada` → `Aguardando pagamento` → `Processada`, com estimativa de data/hora.
   - Cores dos tokens; transição com Motion.
2) **Resumo compacto**
   - Protocolo, Data de criação, Itens, **Custo por item**, **Total**.
3) **CTA primário**
   - “Pagar R$ 180,00” com estados *loading*, *disabled*, *success* e feedback via Sonner.
4) **Aba “Lista de Nomes”**
   - Tabela paginada com busca, upload para inserir/remover nomes e **histórico de alterações** (audit log).
5) **Callout informativo** substitui a faixa; ícone Clock + texto curto.
6) **Acessibilidade**
   - Rótulos, foco visível, ordem tabular coerente.

**Critérios de Aceitação**
- Etapa atual clara; próxima etapa indicada.
- Ao pagar, Stepper avança e dá feedback claro.
- Lista de nomes editável com histórico/sincronismo.

---

## 5) Navegação Lateral (Side)

**Problemas**
- Ícones pequenos, estado ativo fraco, submenu pouco hierárquico; avatar isolado.

**Proposta (Rail + Expandível)**
- **Rail colapsável** (56px) com tooltips; expande para ~240px por clique.
- **Ordem**: Home • Envio de lista (sub: **Enviar**, **Ver listas**) • Relatórios (futuro) • Conta.
- **Footer**: avatar + menu (Perfil, Notificações, Sair).
- Indicador ativo (pill à esquerda), foco visível e navegação por teclado (↑/↓/Enter).

**Critérios de Aceitação**
- Colapso/expansão suave e preferência persistida.
- Estado ativo sempre evidente; tooltips acessíveis.

---

## 6) Componentes Compartilhados (Design System)

- **AppLayout** (Side + Topbar)
- **KpiCard**
- **StatusBadge**
- **Toolbar** (filtros)
- **DataTable** (TanStack)
- **Callout**
- **EmptyState**
- **ConfirmDialog**
- **Toast** (Sonner)
- **Stepper**
- **CopyToClipboard**
- **Pagination**

> Centralizar estilos e variantes no tema e expor tokens (cores, radius, sombras) para fácil manutenção.

---

## 7) Tratamento de Erros

- **Sonner** como único canal de toasts.
- **ErrorBoundary** por rota com Callout, botão “Tentar novamente” e ID de erro.
- **Formulários**: mensagens inline por campo; toast só para erros gerais.
- **Log**: registrar exceções com contexto (rota, usuário, payload sanitizado).

---

## 8) Roadmap (Épicos → Histórias → Aceite)

**Épico 1 – Base Visual & Tokens**
- Criar tokens Tailwind v4 (cores, radius, sombra, tipo).
- Instalar shadcn/ui + Radix; publicar `Button`, `Card`, `Badge`, `Dialog`, `Toast`.
- **Aceite:** dark/light ok; contraste AA passa; tokens aplicados em 2 telas.

**Épico 2 – Infra de Dados & Tabelas**
- Integrar TanStack Query + Table com paginação server-side e seleção.
- **Aceite:** `/visualize` exibe 10/25/50 por página; bulk actions com total.

**Épico 3 – Navegação & Layout**
- Implementar Side rail colapsável, Topbar e estados ativos.
- **Aceite:** navegação por teclado + tooltips.

**Épico 4 – Telas**
- `/home`: KPIs + tabela + callout + recarga com loading.
- `/visualize`: toolbar filtros + bulk bar sticky + toasts.
- `/visualize/:protocol`: stepper + pagamento + aba de nomes.

**Épico 5 – Acessibilidade & QA**
- Keyboard nav completa, foco visível, testes de contraste e smoke tests.
- **Aceite:** checklist AA cumprida; sem warnings no console.

---

## 9) Micro‑padrões que elevam

- **Hovers** com Motion (1–2px de translate + sombra +2).
- **Empty states** com ícone + copy curta + CTA direto.
- **Feedback de cópia** (ex.: protocolo): toast “Copiado!”.
- **Datas relativas** (ex.: “há 5 min”) onde fizer sentido; tooltip com data absoluta.

---

## 10) Erros Visíveis & Correções Rápidas

- **Next.js**: remover `swcMinify` e `future` do `next.config` (warning em `/home`).
- **Toasts soltos**: padronizar com **Sonner** e remover badges/erros flutuantes no rodapé.
- **Chips de Status**: consolidar em `StatusBadge` com tokens.
- **Tabelas**: adicionar filtros, busca, paginação server-side e seleção em massa.
- **Banner lilás**: substituir por `Callout` com tokens da paleta.

---

### Anexos (opcional)
- Se quiser, posso gerar um **kit inicial** (tokens + layout base + 6 componentes shadcn + DataTable) para colar no projeto e ver o visual imediatamente.

