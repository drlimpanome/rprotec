# 📦 Instruções de Deploy via ZIP

## Arquivos Criados

Dois arquivos compactados foram gerados na raiz do projeto:

1. **`rprotec-frontend.tar.gz`** (549 KB)
   - Contém todos os arquivos do frontend Next.js
   - **Excluído**: node_modules, .next, out, build, logs

2. **`rprotec-backend.tar.gz`** (113 KB)
   - Contém todos os arquivos do backend Node.js
   - **Excluído**: node_modules, dist, build, uploads, logs, env, aws.ts

## 🚀 Como Fazer Deploy no EasyPanel

### Opção 1: Upload Direto (Recomendado)

#### Frontend

1. No EasyPanel, crie um novo serviço → **App**
2. Escolha **"Upload Source"** ao invés de Git
3. Faça upload do arquivo `rprotec-frontend.tar.gz`
4. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Port**: `3000`
5. Adicione variáveis de ambiente:
   ```env
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://seu-backend-url
   ```
6. Deploy!

#### Backend

1. No EasyPanel, crie um novo serviço → **App**
2. Escolha **"Upload Source"**
3. Faça upload do arquivo `rprotec-backend.tar.gz`
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npx ts-node src/app.ts`
   - **Port**: `3001`
5. Adicione variáveis de ambiente:
   ```env
   NODE_ENV=production
   PORT=3001
   DATABASE_HOST=seu-host
   DATABASE_PORT=3306
   DATABASE_NAME=seu-banco
   DATABASE_USER=seu-usuario
   DATABASE_PASSWORD=sua-senha
   JWT_SECRET=seu-jwt-secret
   AWS_ACCESS_KEY_ID=sua-aws-key
   AWS_SECRET_ACCESS_KEY=sua-aws-secret
   AWS_REGION=us-east-1
   S3_BUCKET_NAME=seu-bucket
   ```
6. Deploy!

### Opção 2: Upload via Dockerfile (Se Suportar)

Se o EasyPanel suportar Dockerfile com upload de ZIP:

1. Extraia os arquivos do ZIP no EasyPanel
2. O Dockerfile já está incluído em cada pacote
3. Configure apenas as variáveis de ambiente
4. Deploy automático

## 📋 Conteúdo dos Arquivos

### Frontend (`rprotec-frontend.tar.gz`)

```
✅ /src                    (código fonte completo)
✅ /public                 (assets estáticos)
✅ package.json            (dependências)
✅ package-lock.json       (lock de versões)
✅ next.config.mjs         (configuração Next.js)
✅ tsconfig.json           (configuração TypeScript)
✅ Dockerfile              (para deploy com Docker)
✅ .dockerignore           (otimização de build)
❌ node_modules            (excluído - será instalado no deploy)
❌ .next                   (excluído - será gerado no build)
```

### Backend (`rprotec-backend.tar.gz`)

```
✅ /src                    (código fonte completo)
✅ package.json            (dependências)
✅ package-lock.json       (lock de versões)
✅ tsconfig.json           (configuração TypeScript)
✅ env.example             (template de variáveis)
✅ aws.ts.example          (template AWS)
✅ Dockerfile              (para deploy com Docker)
✅ .dockerignore           (otimização de build)
❌ node_modules            (excluído - será instalado no deploy)
❌ env                     (excluído - SECRETS não vão para produção!)
❌ aws.ts                  (excluído - configure via variáveis de ambiente)
```

## 🔒 Configuração de Segurança

### ⚠️ IMPORTANTE: Variáveis de Ambiente

Os arquivos `env` e `aws.ts` **NÃO estão incluídos** por segurança!

Você **DEVE** configurar todas as variáveis de ambiente no painel do EasyPanel:

#### Backend (Obrigatórias):

```env
# Database
DATABASE_HOST=            # Host do MySQL
DATABASE_PORT=3306
DATABASE_NAME=            # Nome do banco
DATABASE_USER=            # Usuário do banco
DATABASE_PASSWORD=        # Senha do banco

# JWT
JWT_SECRET=               # Gerar: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# AWS S3
AWS_ACCESS_KEY_ID=        # Sua chave AWS
AWS_SECRET_ACCESS_KEY=    # Seu secret AWS
AWS_REGION=us-east-1
S3_BUCKET_NAME=           # Nome do bucket
```

#### Frontend:

```env
NEXT_PUBLIC_API_URL=      # URL do backend (ex: https://api.seudominio.com)
```

## 🧪 Testar Localmente

### Extrair e Testar Frontend

```bash
# Extrair
tar -xzf rprotec-frontend.tar.gz -C frontend-test

# Instalar e rodar
cd frontend-test
npm install
npm run dev
```

### Extrair e Testar Backend

```bash
# Extrair
tar -xzf rprotec-backend.tar.gz -C backend-test

# Configurar (copiar do .example)
cd backend-test
cp env.example env
cp aws.ts.example aws.ts
# Editar env e aws.ts com suas credenciais

# Instalar e rodar
npm install
npm run dev
```

## 🔄 Atualizar Arquivos

Se precisar criar novos arquivos ZIP:

```bash
# Frontend
cd /JMFC_group/front-end
tar -czf ../rprotec-frontend.tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='out' \
  --exclude='build' \
  --exclude='*.log' \
  .

# Backend
cd /JMFC_group/back-end
tar -czf ../rprotec-backend.tar.gz \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='build' \
  --exclude='uploads' \
  --exclude='logs' \
  --exclude='env' \
  --exclude='aws.ts' \
  .
```

## 📊 Tamanhos dos Arquivos

| Arquivo | Tamanho | Conteúdo |
|---------|---------|----------|
| `rprotec-frontend.tar.gz` | ~549 KB | Frontend completo (sem node_modules) |
| `rprotec-backend.tar.gz` | ~113 KB | Backend completo (sem node_modules) |

## ✅ Checklist de Deploy

### Antes do Deploy

- [ ] Criar banco de dados MySQL
- [ ] Configurar bucket S3 (se necessário)
- [ ] Gerar JWT_SECRET seguro
- [ ] Preparar todas as credenciais

### Durante o Deploy

- [ ] Upload do arquivo ZIP do backend
- [ ] Configurar todas as variáveis de ambiente do backend
- [ ] Fazer deploy do backend
- [ ] Verificar logs do backend
- [ ] Upload do arquivo ZIP do frontend
- [ ] Configurar NEXT_PUBLIC_API_URL com a URL do backend
- [ ] Fazer deploy do frontend
- [ ] Verificar logs do frontend

### Após o Deploy

- [ ] Testar autenticação
- [ ] Testar conexão com banco de dados
- [ ] Testar upload de arquivos (S3)
- [ ] Configurar domínio customizado
- [ ] Habilitar SSL/HTTPS
- [ ] Configurar backups

## 🆘 Troubleshooting

### Frontend não conecta no backend

1. Verifique a variável `NEXT_PUBLIC_API_URL`
2. Certifique-se que o backend está rodando
3. Verifique CORS no backend

### Backend não conecta no banco

1. Verifique as credenciais no painel de variáveis
2. Certifique-se que o IP do EasyPanel está liberado no firewall do MySQL
3. Teste a conexão manualmente

### Erro ao instalar dependências

1. Limpe o cache do npm: `npm cache clean --force`
2. Delete package-lock.json e rode `npm install` novamente
3. Verifique a versão do Node.js (recomendado: 18+)

## 📞 Suporte

Em caso de dúvidas:
1. Consulte `DEPLOY_EASYPANEL.md` para instruções detalhadas
2. Verifique os logs do serviço no EasyPanel
3. Entre em contato com o suporte

---

**✨ Boa sorte com o deploy!**

