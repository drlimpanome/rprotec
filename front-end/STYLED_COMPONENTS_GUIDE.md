# Guia de Componentes Estilizados

Este documento descreve como usar os componentes estilizados com o novo tema corporativo do JMFC Group.

## Cores Corporativas

- **Primary**: #1A0B44 (Roxo Escuro)
- **Secondary**: #003677 (Azul Escuro)
- **Tertiary**: #0060A0 (Azul Royal)
- **Accent 1**: #008BBB (Azul Ciano)
- **Accent 2**: #00B7C5 (Turquesa)
- **Accent 3**: #00E1C2 (Teal Brilhante)

## Componentes Disponíveis

### 1. StyledCard
Card com glassmorphism e efeitos modernos.

```tsx
import { StyledCard } from '@/components/core/styled-components';

<StyledCard>
  <h3>Título</h3>
  <p>Conteúdo do card</p>
</StyledCard>
```

**Características:**
- Fundo translúcido com blur
- Border acento corporativo
- Hover effect com glow

### 2. StyledButton
Botão com gradiente corporativo principal.

```tsx
import { StyledButton } from '@/components/core/styled-components';

<StyledButton variant="contained" onClick={() => {}}>
  Clique aqui
</StyledButton>
```

**Características:**
- Gradiente roxo → azul
- Elevation ao hover
- Transform suave

### 3. StyledButtonAccent
Botão com gradiente de acento.

```tsx
import { StyledButtonAccent } from '@/components/core/styled-components';

<StyledButtonAccent variant="contained" onClick={() => {}}>
  Ação Especial
</StyledButtonAccent>
```

**Características:**
- Gradiente ciano → turquesa → teal
- Perfeito para ações secundárias

### 4. StyledContainer
Container para agrupar elementos.

```tsx
import { StyledContainer } from '@/components/core/styled-components';

<StyledContainer>
  <h2>Seção</h2>
  {/* Conteúdo */}
</StyledContainer>
```

### 5. StyledSectionHeader
Header com gradient text corporativo.

```tsx
import { StyledSectionHeader } from '@/components/core/styled-components';

<StyledSectionHeader>
  <h2>Título da Seção</h2>
</StyledSectionHeader>
```

**Características:**
- Border gradiente na base
- Texto em gradient corporativo

### 6. StyledBadge
Badge para status ou tags.

```tsx
import { StyledBadge } from '@/components/core/styled-components';

<StyledBadge>Novo</StyledBadge>
<StyledBadge>Em Progresso</StyledBadge>
```

### 7. StyledTableHead
Header para tabelas.

```tsx
import { StyledTableHead } from '@/components/core/styled-components';

<table>
  <StyledTableHead>
    <tr>
      <th>Coluna 1</th>
      <th>Coluna 2</th>
    </tr>
  </StyledTableHead>
  <tbody>
    {/* Linhas */}
  </tbody>
</table>
```

### 8. StyledInput
Input com border corporativo.

```tsx
import { StyledInput } from '@/components/core/styled-components';

<StyledInput 
  type="text" 
  placeholder="Digite aqui..." 
/>
```

### 9. StyledDivider
Divider com gradiente.

```tsx
import { StyledDivider } from '@/components/core/styled-components';

<StyledDivider />
```

### 10. StyledStatusIndicator
Indicador de status com animação.

```tsx
import { StyledStatusIndicator } from '@/components/core/styled-components';

<StyledStatusIndicator status="success">Ativo</StyledStatusIndicator>
<StyledStatusIndicator status="warning">Pendente</StyledStatusIndicator>
<StyledStatusIndicator status="error">Erro</StyledStatusIndicator>
<StyledStatusIndicator status="info">Informação</StyledStatusIndicator>
```

## Variáveis CSS Globais

Você pode usar as variáveis CSS definidas em `global.css`:

```css
/* Cores */
--color-primary: #1a0b44;
--color-secondary: #003677;
--color-tertiary: #0060a0;
--color-accent-1: #008bbb;
--color-accent-2: #00b7c5;
--color-accent-3: #00e1c2;

/* Gradientes */
--gradient-primary: linear-gradient(135deg, #1a0b44 0%, #003677 50%, #0060a0 100%);
--gradient-accent: linear-gradient(135deg, #008bbb 0%, #00b7c5 50%, #00e1c2 100%);

/* Sombras */
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.15);
--shadow-glow: 0 0 20px rgba(0, 183, 197, 0.3);
```

## Animações Disponíveis

```tsx
/* Fade In */
<div className="animate-fade-in">Conteúdo</div>

/* Slide In Left */
<div className="animate-slide-in-left">Menu</div>

/* Slide In Up */
<div className="animate-slide-in-up">Card</div>

/* Pulse */
<div className="animate-pulse">Carregando...</div>

/* Glow */
<div className="animate-glow">Destaque</div>
```

## Exemplo Completo

```tsx
'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { StyledCard, StyledButton, StyledButtonAccent, StyledSectionHeader, StyledBadge } from '@/components/core/styled-components';

export default function ExemploPage() {
  return (
    <Box sx={{ p: 3 }}>
      <StyledSectionHeader>
        <h2>Exemplo de Layout</h2>
      </StyledSectionHeader>

      <Stack spacing={3}>
        <StyledCard>
          <h3>Card Principal</h3>
          <p>Este é um card estilizado com o novo tema corporativo.</p>
          
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <StyledButton variant="contained">Ação Principal</StyledButton>
            <StyledButtonAccent variant="outlined">Ação Especial</StyledButtonAccent>
          </Box>
        </StyledCard>

        <StyledCard>
          <h3>Status</h3>
          <Stack direction="row" spacing={1}>
            <StyledBadge>Ativo</StyledBadge>
            <StyledBadge>Pendente</StyledBadge>
          </Stack>
        </StyledCard>
      </Stack>
    </Box>
  );
}
```

## Melhorias Implementadas

✅ **Sidebar com Gradiente Corporativo** - Aplicação correta das cores primárias
✅ **Perfil no Rodapé** - Avatar com glow effect no canto inferior esquerdo
✅ **Sem Header** - Layout mais limpo e espaçoso
✅ **Componentes Estilizados** - Conjunto completo de componentes reutilizáveis
✅ **Animações Suaves** - Transições elegantes em toda a aplicação
✅ **Glassmorphism** - Efeitos visuais modernos com blur backgrounds

## Próximos Passos

Para melhorar ainda mais o frontend:

1. Integrar `StyledCard` nas páginas existentes
2. Substituir `StyledButton` pelos botões padrão do Material-UI
3. Usar `StyledTableHead` nas tabelas do dashboard
4. Aplicar `StyledInput` em formulários
5. Revisar gradientes em componentes específicos conforme necessário
