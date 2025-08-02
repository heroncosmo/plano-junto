# 🔧 Configuração do Arquivo .env

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
NEXT_PUBLIC_SUPABASE_URL=https://geojqrpzcyiyhjzobggy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdlb2pxcnB6Y3lpeWhqem9iZ2d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5Nzg2MjksImV4cCI6MjA2OTU1NDYyOX0.GOYSjVMwIIrmCaTWc6lXUadCyIclaMYeqRrwapiFWg8
```

## 📋 Passos para Configurar:

1. **Crie o arquivo .env** na raiz do projeto (mesmo nível do package.json)
2. **Cole o conteúdo acima** no arquivo
3. **Salve o arquivo**
4. **Reinicie o servidor** de desenvolvimento:
   ```bash
   npm run dev
   ```

## ✅ Verificação:

Após criar o arquivo .env, o sistema deve funcionar corretamente com:
- ✅ Conexão com o Supabase estabelecida
- ✅ Autenticação funcionando
- ✅ Todas as funções do banco operacionais

## 🚨 Importante:

- O arquivo `.env` não deve ser commitado no git
- As credenciais são seguras para uso em desenvolvimento
- Para produção, use variáveis de ambiente do servidor 