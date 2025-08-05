import { useState, useEffect } from 'react';
import { getAvailableGroups } from '@/integrations/supabase/functions';

export interface PublicGroup {
  id: string;
  name: string;
  description: string;
  max_members: number;
  current_members: number;
  price_per_slot_cents: number;
  status: string;
  relationship_type: string;
  created_at: string;
  services?: {
    id: string;
    name: string;
    category: string;
    icon_url?: string;
  };
}

export const usePublicGroups = () => {
  const [groups, setGroups] = useState<PublicGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const groupsData = await getAvailableGroups();
      setGroups(groupsData);
    } catch (err) {
      console.error('Erro ao buscar grupos públicos:', err);
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