# R-Protec - Sistema de Gerenciamento

Sistema completo com frontend moderno (Next.js 15 + Material-UI) e backend robusto (Node.js + MySQL).

## 🚀 Tecnologias

### Frontend
- **Next.js 15.5.6** - Framework React com App Router
- **Material-UI (MUI)** - Componentes UI modernos
- **TypeScript** - Tipagem estática
- **Phosphor Icons** - Biblioteca de ícones
- **React Toastify** - Notificações elegantes
- **Day.js** - Manipulação de datas

### Backend
- **Node.js + Express** - API RESTful
- **Sequelize** - ORM para MySQL
- **JWT** - Autenticação
- **AWS S3** - Armazenamento de arquivos
- **TypeScript** - Tipagem estática

## 📦 Estrutura do Projeto

```
JMFC_group/
├── front-end/          # Aplicação Next.js
│   ├── src/
│   │   ├── app/        # Pages e layouts (App Router)
│   │   ├── components/ # Componentes reutilizáveis
│   │   ├── styles/     # Estilos e tema corporativo
│   │   ├── services/   # Serviços de API
│   │   └── hooks/      # Custom hooks
│   └── public/         # Assets estáticos
│
└── back-end/           # API Node.js
    ├── src/
    │   ├── controllers/
    │   ├── models/
    │   ├── routes/
    │   └── utils/
    └── env.example     # Variáveis de ambiente (exemplo)
```

## ⚙️ Configuração

### 1. Backend

```bash
cd back-end

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp env.example env
# Editar o arquivo 'env' com suas credenciais

# Configurar AWS (se usar S3)
cp aws.ts.example aws.ts
# Editar o arquivo 'aws.ts' com suas chaves AWS

# Iniciar servidor de desenvolvimento
npm run dev
```

**Variáveis de ambiente necessárias** (`back-end/env`):
- `DATABASE_NAME` - Nome do banco MySQL
- `DATABASE_USER` - Usuário do banco
- `DATABASE_PASSWORD` - Senha do banco
- `DATABASE_HOST` - Host do banco (ex: localhost)
- `DATABASE_PORT` - Porta do MySQL (padrão: 3306)
- `JWT_SECRET` - Secret para JWT
- `AWS_ACCESS_KEY_ID` - Chave AWS (se usar S3)
- `AWS_SECRET_ACCESS_KEY` - Secret AWS (se usar S3)

### 2. Frontend

```bash
cd front-end

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em: `http://localhost:3000`

## 🎨 Features Implementadas

### ✅ Sidebar Moderna
- Sistema pin/unpin com persistência em localStorage
- Expand on hover quando unpinned
- Ícone de pin dinâmico
- Transições suaves
- Empurra o conteúdo quando pinned

### ✅ Breadcrumbs Navegáveis
- Implementado em todas as páginas principais
- Navegação intuitiva com ícone de casa
- Separadores customizados
- Último item destacado

### ✅ Cores Corporativas
Paleta aplicada consistentemente:
- `#1A0B44` - Primary (roxo escuro)
- `#003677` - Secondary (azul escuro)
- `#0060A0` - Tertiary (azul médio)
- `#008BBB` - Accent 1 (ciano)
- `#00B7C5` - Accent 2 (turquesa)
- `#00E1C2` - Accent 3 (verde água)

### ✅ Layout Responsivo
- Container main com fundo contrastante (#F8F9FA)
- Glassmorphism nos cards principais
- Mobile bottom navigation
- Adapta-se a diferentes tamanhos de tela

## 📝 Scripts Disponíveis

### Frontend
```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run start    # Servidor de produção
npm run lint     # Executar linter
```

### Backend
```bash
npm run dev      # Servidor de desenvolvimento com nodemon
npm start        # Servidor de produção
```

## 🔒 Segurança

⚠️ **IMPORTANTE**: 
- Arquivos `back-end/env` e `back-end/aws.ts` estão no `.gitignore`
- Nunca commite credenciais reais
- Use os arquivos `.example` como template

## 🤝 Contribuindo

1. Clone o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Copyright © 2025 R-Protec. Todos os direitos reservados.

## 👥 Equipe

Desenvolvido com ❤️ pela equipe R-Protec

---

**Status do Projeto**: ✅ Em desenvolvimento ativo

