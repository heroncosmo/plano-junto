# Corrigir Nome do Admin na Listagem de Grupos

## Problema
Na listagem de grupos em http://localhost:8080/groups, o nome do admin não está aparecendo.

## Solução
Execute o seguinte SQL no painel do Supabase:

```sql
-- Garantir que a view groups_detailed existe com o admin_name
DROP VIEW IF EXISTS groups_detailed;

CREATE OR REPLACE VIEW groups_detailed AS
SELECT 
  g.*,
  s.name as service_name,
  s.category as service_category,
  s.icon_url as service_icon,
  p.full_name as admin_name,
  CASE 
    WHEN g.current_members >= g.max_members THEN 'full'
    WHEN g.current_members = 0 THEN 'empty'
    ELSE 'available'
  END as availability_status
FROM public.groups g
JOIN public.services s ON g.service_id = s.id
JOIN public.profiles p ON g.admin_id = p.user_id;
```

## Como executar:
1. Acesse o painel do Supabase
2. Vá para SQL Editor
3. Cole o código acima
4. Clique em "Run"

## O que foi alterado:
1. **Função getAvailableGroups**: Agora usa a view `groups_detailed` que inclui o `admin_name`
2. **View groups_detailed**: Garante que o nome do admin seja incluído na consulta
3. **Frontend**: Já estava preparado para exibir o `admin_name`

## Resultado esperado:
Após executar o SQL, o nome do admin deve aparecer na listagem de grupos em "Admin: [Nome do Admin]" 