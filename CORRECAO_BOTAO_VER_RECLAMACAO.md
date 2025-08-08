# ✅ Correção do Botão "Ver Reclamação Aberta"

## 🎯 Problema Identificado

**Situação:** Reclamação criada com sucesso e aparece no admin e em `/reclamacoes`, mas na página de detalhes do grupo (`/group/ID`) não aparece o botão "Ver reclamação aberta".

**Causa:** Hook `useComplaintCheck` foi simplificado demais e não estava fazendo verificação real das reclamações ativas.

## 🔧 Correções Aplicadas

### **1. Hook useComplaintCheck Restaurado**
```typescript
// ANTES: Hook simplificado que retornava valores padrão
export const useComplaintCheck = (_groupId: string): ComplaintCheck => {
  return {
    hasActiveComplaint: false,
    complaintId: undefined,
    complaintStatus: undefined,
    loading: false
  };
};

// DEPOIS: Hook funcional que verifica reclamações reais
export const useComplaintCheck = (groupId: string): ComplaintCheck => {
  const [hasActiveComplaint, setHasActiveComplaint] = useState(false);
  const [complaintId, setComplaintId] = useState<string | undefined>();
  const [complaintStatus, setComplaintStatus] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const checkActiveComplaint = async () => {
    // Consulta real ao banco para verificar reclamações ativas
    const { data, error } = await supabase
      .from('complaints')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('group_id', groupId)
      .in('status', ['pending', 'admin_responded', 'user_responded'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    // Atualiza estados baseado no resultado
  };

  useEffect(() => {
    checkActiveComplaint();
  }, [user, groupId]);

  return {
    hasActiveComplaint,
    complaintId,
    complaintStatus,
    loading,
    refetch: checkActiveComplaint
  };
};
```

### **2. Interface Atualizada**
```typescript
export interface ComplaintCheck {
  hasActiveComplaint: boolean;
  complaintId?: string;
  complaintStatus?: string;
  loading: boolean;
  refetch: () => Promise<void>; // ✅ Adicionada função refetch
}
```

### **3. Verificação no Focus da Página**
```typescript
// Verificar membership e reclamações quando a página ganha foco
useEffect(() => {
  const handleFocus = () => {
    setTimeout(() => {
      checkUserMembership();
      refetchComplaint(); // ✅ Verifica reclamações também
    }, 500);
  };

  window.addEventListener('focus', handleFocus);
  return () => window.removeEventListener('focus', handleFocus);
}, [id, user?.id]);
```

### **4. Botão Inteligente Mantido**
```typescript
<Button
  variant="ghost"
  className="w-full justify-between text-left text-sm"
  onClick={handleOpenComplaint}
  disabled={complaintCheckLoading}
>
  <span>
    {complaintCheckLoading 
      ? 'Verificando...' 
      : hasActiveComplaint 
        ? 'Ver reclamação aberta'  // ✅ Aparece quando há reclamação
        : 'Abrir uma reclamação'   // ✅ Aparece quando não há
    }
  </span>
</Button>
```

## 📊 Status Atual Verificado

### **Reclamação Ativa Detectada**
- **ID:** `8cbc9962-800a-4387-bdb1-5bef874f6ea3`
- **Status:** `pending`
- **Criada em:** 2025-08-08 00:56:25
- **Tipo:** `subscription_stopped`

### **Função de Verificação**
```sql
SELECT can_user_create_complaint(
  '54f2830f-4015-4117-9842-b4697ef84172'::UUID,
  '4cb410c0-2f22-4e8d-87fc-ae007c373e89'::UUID
);

-- RESULTADO: ✅
{
  "can_create": false,
  "reason": "Usuário já possui reclamação ativa para este grupo"
}
```

## 🎯 Fluxo Corrigido

### **Antes (Com Problema)**
```
1. Usuário cria reclamação → ✅ Criada no banco
2. Aparece em /reclamacoes → ✅ Funciona
3. Aparece no admin → ✅ Funciona  
4. Volta para /group/ID → ❌ Hook retorna valores padrão
5. Botão mostra "Abrir reclamação" → ❌ Incorreto
```

### **Depois (Funcionando)**
```
1. Usuário cria reclamação → ✅ Criada no banco
2. Aparece em /reclamacoes → ✅ Funciona
3. Aparece no admin → ✅ Funciona
4. Volta para /group/ID → ✅ Hook consulta banco real
5. Hook detecta reclamação ativa → ✅ hasActiveComplaint = true
6. Botão mostra "Ver reclamação aberta" → ✅ Correto
```

## 🧪 Como Testar

### **1. Teste de Detecção de Reclamação**
1. Acesse: `http://localhost:8080/group/4cb410c0-2f22-4e8d-87fc-ae007c373e89`
2. ✅ **Deve mostrar "Ver reclamação aberta"** (não "Abrir reclamação")
3. ✅ **Clique deve levar para ver a reclamação existente**

### **2. Teste de Navegação**
1. Crie uma nova reclamação
2. Volte para página do grupo
3. ✅ **Deve detectar automaticamente a nova reclamação**

### **3. Teste de Recarregamento**
1. Recarregue a página do grupo (F5)
2. ✅ **Deve continuar mostrando "Ver reclamação aberta"**

## 🎉 Resultado Final

**PROBLEMA RESOLVIDO:**

### **✅ Hook Funcional**
- Consulta real ao banco de dados
- Detecta reclamações ativas corretamente
- Atualiza interface automaticamente

### **✅ Botão Inteligente**
- "Ver reclamação aberta" quando há reclamação
- "Abrir uma reclamação" quando não há
- Navegação correta para ambos os casos

### **✅ Sincronização Completa**
- Reclamação aparece em todos os lugares
- Interface consistente em toda aplicação
- Verificação automática no focus da página

### **✅ Performance Otimizada**
- Consulta apenas quando necessário
- Função refetch para atualizações manuais
- Evita loops infinitos

**Agora o botão "Ver reclamação aberta" aparece corretamente na página de detalhes do grupo!** ✅
