import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Group {
  id: string;
  name: string;
  description: string;
  max_members: number;
  current_members: number;
  price_per_slot_cents: number;
  relationship_type: string;
  status: string;
  instant_access: boolean;
  created_at: string;
  rules?: string;
  fidelity_months?: number;
  admin_seals?: string[];
  situation?: string;
  other_info?: string;
  services?: {
    id: string;
    name: string;
    category: string;
    icon_url?: string;
  };
  group_memberships?: {
    id: string;
    user_id: string;
    joined_at: string;
  }[];
}

export const useGroups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      
              const { data, error } = await supabase
          .from('groups')
          .select(`
            *,
            services:service_id (
              id,
              name,
              category,
              icon_url
            )
          `)
          .eq('status', 'active_with_slots')
          .order('created_at', { ascending: false });

      if (error) throw error;

      setGroups(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError('Erro ao carregar grupos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return {
    groups,
    loading,
    error,
    refetch: fetchGroups
  };
};

export const useGroupById = (groupId: string) => {
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroup = async () => {
      if (!groupId) return;

      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('groups')
          .select(`
            *,
            services:service_id (
              id,
              name,
              category,
              icon_url
            ),
            group_memberships (
              id,
              user_id,
              joined_at
            )
          `)
          .eq('id', groupId)
          .single();

        if (error) throw error;

        setGroup(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching group:', err);
        setError('Erro ao carregar grupo');
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId]);

  return { group, loading, error };
};

// Hook para buscar grupos por categoria
export const useGroupsByCategory = (category?: string) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroupsByCategory = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from('groups')
          .select(`
            *,
            services:service_id (
              id,
              name,
              category,
              icon_url
            )
          `)
          .eq('status', 'active_with_slots');

        if (category && category !== 'all') {
          query = query.eq('services.category', category);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        setGroups(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching groups by category:', err);
        setError('Erro ao carregar grupos');
      } finally {
        setLoading(false);
      }
    };

    fetchGroupsByCategory();
  }, [category]);

  return { groups, loading, error };
};

// Função helper para formatação
export const formatPrice = (cents: number): string => {
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
};

export const formatCategory = (category: string): string => {
  const categoryMap: Record<string, string> = {
    'ai_tools': 'IA & Produtividade',
    'streaming': 'Streaming',
    'gaming': 'Jogos',
    'design': 'Design & Criatividade',
    'education': 'Educação',
    'productivity': 'Software'
  };
  
  return categoryMap[category] || category;
};