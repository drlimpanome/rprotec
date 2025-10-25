# 🚀 Deploy no EasyPanel

Guia completo para fazer deploy do R-Protec no EasyPanel.

## 📋 Pré-requisitos

- Conta no EasyPanel
- Repositório Git configurado
- Banco de dados MySQL disponível
- Credenciais AWS S3 (para upload de arquivos)

## 🐳 Estrutura Docker

O projeto possui:
- **Frontend**: `front-end/Dockerfile` (Next.js 15)
- **Backend**: `back-end/Dockerfile` (Node.js + TypeScript)
- **Docker Compose**: `docker-compose.yml` (para desenvolvimento local)

## 📦 Deploy do Backend

### 1. Criar Novo Serviço no EasyPanel

1. Acesse seu projeto no EasyPanel
2. Clique em **"Add Service"**
3. Selecione **"App"**
4. Configure:
   - **Name**: `rprotec-backend`
   - **Source**: Git Repository
   - **Repository**: `git@github.com:drlimpanome/rprotec.git`
   - **Branch**: `master`
   - **Build Path**: `/back-end`
   - **Dockerfile Path**: `/back-end/Dockerfile`

### 2. Configurar Variáveis de Ambiente

No painel de Environment Variables, adicione:

```env
NODE_ENV=production
PORT=3001

# Database
DATABASE_HOST=seu-host-mysql
DATABASE_PORT=3306
DATABASE_NAME=rprotec_db
DATABASE_USER=seu_usuario
DATABASE_PASSWORD=sua_senha

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro_aqui

# AWS S3
AWS_ACCESS_KEY_ID=sua_aws_key
AWS_SECRET_ACCESS_KEY=sua_aws_secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=seu-bucket-name
```

### 3. Configurar Porta

- **Internal Port**: `3001`
- **External Port**: (deixar o EasyPanel definir automaticamente)

### 4. Deploy

Clique em **"Deploy"** e aguarde o build completar.

## 🎨 Deploy do Frontend

### 1. Criar Novo Serviço no EasyPanel

1. Clique em **"Add Service"**
2. Selecione **"App"**
3. Configure:
   - **Name**: `rprotec-frontend`
   - **Source**: Git Repository
   - **Repository**: `git@github.com:drlimpanome/rprotec.git`
   - **Branch**: `master`
   - **Build Path**: `/front-end`
   - **Dockerfile Path**: `/front-end/Dockerfile`

### 2. Configurar Variáveis de Ambiente

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://seu-backend-url.easypanel.host
```

⚠️ **IMPORTANTE**: Substitua `seu-backend-url` pela URL real do seu backend após o deploy.

### 3. Configurar Porta

- **Internal Port**: `3000`
- **External Port**: (deixar o EasyPanel definir automaticamente)

### 4. Configurar Domínio

1. Após o deploy, vá em **"Domains"**
2. Adicione seu domínio customizado ou use o subdomínio do EasyPanel
3. Configure SSL (geralmente automático com Let's Encrypt)

### 5. Deploy

Clique em **"Deploy"** e aguarde o build completar.

## 🔄 Deploy Completo (Alternativa: Docker Compose)

Se o EasyPanel suportar Docker Compose, você pode usar:

### 1. Criar arquivo `.env` no EasyPanel

```env
# Database
DATABASE_HOST=seu-host-mysql
DATABASE_PORT=3306
DATABASE_NAME=rprotec_db
DATABASE_USER=seu_usuario
DATABASE_PASSWORD=sua_senha

# JWT
JWT_SECRET=seu_jwt_secret

# AWS
AWS_ACCESS_KEY_ID=sua_aws_key
AWS_SECRET_ACCESS_KEY=sua_aws_secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=seu-bucket

# Frontend
NEXT_PUBLIC_API_URL=http://backend:3001
```

### 2. Deploy via Docker Compose

```bash
docker-compose up -d
```

## 🧪 Testar Localmente Antes do Deploy

### Construir Imagens

```bash
# Backend
cd back-end
docker build -t rprotec-backend .

# Frontend
cd ../front-end
docker build -t rprotec-frontend .
```

### Rodar com Docker Compose

```bash
# Na raiz do projeto
docker-compose up
```

Acesse:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## ⚙️ Configurações Importantes

### Health Checks

Ambos os serviços incluem health checks:

**Backend**: 
```dockerfile
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3001/health"]
```

**Frontend**:
```dockerfile
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/"]
```

### Recursos Recomendados

**Backend**:
- CPU: 1 vCPU
- RAM: 1GB (mínimo) / 2GB (recomendado)
- Storage: 10GB

**Frontend**:
- CPU: 0.5 vCPU
- RAM: 512MB (mínimo) / 1GB (recomendado)
- Storage: 5GB

## 🔒 Segurança

### Checklist de Segurança

- [ ] Variáveis de ambiente configuradas (não hardcoded)
- [ ] JWT_SECRET gerado de forma segura
- [ ] Banco de dados com senha forte
- [ ] AWS keys com permissões mínimas necessárias
- [ ] HTTPS habilitado (SSL/TLS)
- [ ] CORS configurado corretamente no backend
- [ ] Rate limiting implementado (se necessário)

### Gerar JWT Secret Seguro

```bash
# No terminal
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 📊 Monitoramento

### Logs

No EasyPanel, acesse os logs através de:
1. Dashboard → Seu serviço → **"Logs"**
2. Filtre por nível (error, warn, info)

### Métricas

Monitore:
- **CPU Usage**: < 80%
- **Memory Usage**: < 85%
- **Response Time**: < 500ms
- **Error Rate**: < 1%

## 🔄 Atualizações

### Deploy de Nova Versão

1. Push para o repositório Git:
```bash
git add .
git commit -m "feat: Nova feature"
git push origin master
```

2. No EasyPanel:
   - Vá em **"Deployments"**
   - Clique em **"Redeploy"**
   - Ou configure **Auto-deploy** em Settings

### Rollback

Se algo der errado:
1. Vá em **"Deployments"**
2. Selecione um deploy anterior
3. Clique em **"Redeploy"**

## 🆘 Troubleshooting

### Backend não conecta no banco

1. Verifique se as credenciais estão corretas
2. Verifique se o IP do EasyPanel está liberado no firewall do MySQL
3. Teste a conexão manualmente

### Frontend não conecta no backend

1. Verifique a variável `NEXT_PUBLIC_API_URL`
2. Certifique-se que o backend está rodando
3. Verifique CORS no backend

### Build falha

1. Limpe o cache: **Settings → Build Cache → Clear**
2. Verifique os logs de build
3. Teste localmente com Docker

### Container reinicia constantemente

1. Verifique os logs
2. Verifique o health check
3. Aumente os recursos (RAM/CPU)

## 📞 Suporte

Se precisar de ajuda:
1. Consulte a documentação do EasyPanel
2. Verifique os logs detalhados
3. Entre em contato com o time de suporte

---

✅ **Deploy concluído com sucesso!**

Acesse sua aplicação em:
- Frontend: https://seu-dominio.com
- Backend API: https://api.seu-dominio.com

