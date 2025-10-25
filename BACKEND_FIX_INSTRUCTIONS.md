# 🔧 Correção de Erro de Configuração do Banco de Dados

## ❌ Problema Identificado

O erro `TypeError: Cannot read properties of undefined (reading 'database')` ocorre porque:

1. **Variáveis de ambiente não configuradas** no EasyPanel
2. **Configuração de ambiente** não reconhece o ambiente `production`
3. **Nomes de variáveis** inconsistentes entre Dockerfile e código

## ✅ Correções Implementadas

### 1. **Arquivo de Configuração Atualizado** (`src/config/database.js`)

```javascript
const databaseConfig = {
  development: {
    username: process.env.DATABASE_USER || process.env.DB_USER || "user",
    password: process.env.DATABASE_PASSWORD || process.env.DB_PASS || "password",
    database: process.env.DATABASE_NAME || process.env.DB_NAME || "impactus_db",
    host: process.env.DATABASE_HOST || process.env.DB_HOST || "localhost",
    port: process.env.DATABASE_PORT || process.env.DB_PORT || 3306,
    dialect: "mysql",
  },
  production: {
    username: process.env.DATABASE_USER || process.env.DB_USER || "user",
    password: process.env.DATABASE_PASSWORD || process.env.DB_PASS || "password",
    database: process.env.DATABASE_NAME || process.env.DB_NAME || "impactus_db",
    host: process.env.DATABASE_HOST || process.env.DB_HOST || "localhost",
    port: process.env.DATABASE_PORT || process.env.DB_PORT || 3306,
    dialect: "mysql",
  },
};
```

### 2. **Database.ts Melhorado** (`src/database.ts`)

```typescript
import { Sequelize } from "sequelize";
const databaseConfig = require("./config/database");

type Environment = "development" | "production";
const environment = (process.env.NODE_ENV || "development") as Environment;

const config = databaseConfig[environment];

if (!config) {
  throw new Error(`Database configuration not found for environment: ${environment}`);
}

export const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);
```

### 3. **Arquivo .env.example Atualizado**

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Database Configuration (Primary)
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=rprotec_db
DATABASE_USER=your_database_user
DATABASE_PASSWORD=your_database_password

# Alternative Database Variables (for compatibility)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=rprotec_db
DB_USER=your_database_user
DB_PASS=your_database_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_generate_with_crypto_randomBytes_64

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
```

## 🚀 Deploy Corrigido no EasyPanel

### **Arquivo Atualizado**: `rprotec-backend-fixed.tar.gz` (114 KB)

### **Variáveis de Ambiente OBRIGATÓRIAS**:

```env
# ⚠️ CONFIGURE TODAS ESTAS VARIÁVEIS NO EASYPANEL

# Server
NODE_ENV=production
PORT=3001

# Database (use os nomes DATABASE_*)
DATABASE_HOST=seu-host-mysql
DATABASE_PORT=3306
DATABASE_NAME=rprotec_db
DATABASE_USER=seu_usuario
DATABASE_PASSWORD=sua_senha

# JWT (GERE UMA CHAVE SEGURA!)
JWT_SECRET=seu_jwt_secret_aqui

# AWS S3 (se usar upload de arquivos)
AWS_ACCESS_KEY_ID=sua_aws_key
AWS_SECRET_ACCESS_KEY=sua_aws_secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=seu-bucket
```

### **Como Gerar JWT_SECRET Seguro**:

```bash
# No terminal local ou online
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🔍 Checklist de Deploy

### ✅ **Antes do Deploy**

- [ ] **Banco MySQL criado** e acessível
- [ ] **Credenciais do banco** preparadas
- [ ] **JWT_SECRET gerado** (64 caracteres hexadecimais)
- [ ] **AWS S3 configurado** (se necessário)
- [ ] **IP do EasyPanel liberado** no firewall do MySQL

### ✅ **Durante o Deploy**

1. **Upload do arquivo**: `rprotec-backend-fixed.tar.gz`
2. **Configurar Build Command**: `npm install`
3. **Configurar Start Command**: `npx ts-node src/app.ts`
4. **Configurar Port**: `3001`
5. **Adicionar TODAS as variáveis de ambiente** listadas acima
6. **Deploy!**

### ✅ **Após o Deploy**

- [ ] **Verificar logs** do serviço
- [ ] **Testar conexão** com banco de dados
- [ ] **Verificar se não há erros** de configuração
- [ ] **Testar endpoints** da API

## 🆘 Troubleshooting

### **Erro: "Database configuration not found"**

**Causa**: `NODE_ENV` não está definido como `production`

**Solução**: 
```env
NODE_ENV=production
```

### **Erro: "Cannot connect to database"**

**Causa**: Credenciais incorretas ou banco inacessível

**Solução**:
1. Verifique as credenciais no painel do EasyPanel
2. Teste a conexão manualmente
3. Verifique se o IP do EasyPanel está liberado no MySQL

### **Erro: "JWT_SECRET is not defined"**

**Causa**: JWT_SECRET não configurado

**Solução**:
```env
JWT_SECRET=seu_jwt_secret_de_64_caracteres_aqui
```

### **Erro: "AWS credentials not found"**

**Causa**: Credenciais AWS não configuradas (se usar S3)

**Solução**:
```env
AWS_ACCESS_KEY_ID=sua_key
AWS_SECRET_ACCESS_KEY=sua_secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=seu-bucket
```

## 📊 Comparação dos Arquivos

| Arquivo | Tamanho | Status | Correções |
|---------|---------|--------|-----------|
| `rprotec-backend.tar.gz` | 113 KB | ❌ Com erro | Versão original |
| `rprotec-backend-fixed.tar.gz` | 114 KB | ✅ Corrigido | Configuração melhorada |

## 🔄 Próximos Passos

1. **Baixe o arquivo corrigido**: `rprotec-backend-fixed.tar.gz`
2. **Faça upload no EasyPanel**
3. **Configure TODAS as variáveis de ambiente**
4. **Deploy e teste!**

## 📞 Suporte

Se ainda houver problemas:

1. **Verifique os logs** detalhados no EasyPanel
2. **Confirme todas as variáveis** estão configuradas
3. **Teste a conexão** com o banco manualmente
4. **Entre em contato** com o suporte

---

**✅ Problema resolvido! Use o arquivo `rprotec-backend-fixed.tar.gz`**

