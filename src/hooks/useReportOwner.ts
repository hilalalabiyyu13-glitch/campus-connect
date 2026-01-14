import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export function useReportOwner(reportId: number) {
  const { user } = useAuth();
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOwnership = async () => {
      if (!user || !reportId) {
        setIsOwner(false);
        setLoading(false);
        return;
      }

      try {
        const { data: report } = await supabase
          .from('laporan')
          .select('pengguna_id')
          .eq('id', reportId)
          .single();

        setIsOwner(report?.pengguna_id === user.id);
      } catch (error) {
        console.error('Error checking report ownership:', error);
        setIsOwner(false);
      } finally {
        setLoading(false);
      }
    };

    checkOwnership();
  }, [user, reportId]);

  return { isOwner, loading };
}