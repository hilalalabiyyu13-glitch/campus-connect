import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Klaim, KlaimFormData } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useUserClaims() {
  const { user } = useAuth();
  const [claims, setClaims] = useState<Klaim[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchClaims = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('klaim')
        .select(`
          *,
          laporan:laporan(
            *,
            category:categories(*)
          )
        `)
        .eq('user_id_klaim', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setClaims((data || []) as unknown as Klaim[]);
    } catch (error) {
      console.error('Error fetching claims:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat klaim Anda',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [user]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('klaim-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'klaim', filter: `user_id_klaim=eq.${user.id}` },
        () => {
          fetchClaims();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { claims, loading, refetch: fetchClaims };
}

export function useAllClaims() {
  const [claims, setClaims] = useState<Klaim[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('klaim')
        .select(`
          *,
          laporan:laporan(
            *,
            category:categories(*)
          ),
          profile:profiles(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setClaims((data || []) as unknown as Klaim[]);
    } catch (error) {
      console.error('Error fetching all claims:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat semua klaim',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('all-klaim-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'klaim' },
        () => {
          fetchClaims();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { claims, loading, refetch: fetchClaims };
}

export function useCreateClaim() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createClaim = async (data: KlaimFormData) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Anda harus login terlebih dahulu',
        variant: 'destructive',
      });
      return null;
    }

    setLoading(true);
    try {
      // Check if user already claimed this report
      const { data: existingClaim } = await supabase
        .from('klaim')
        .select('id')
        .eq('laporan_ditemukan_id', data.laporan_ditemukan_id)
        .eq('user_id_klaim', user.id)
        .single();

      if (existingClaim) {
        toast({
          title: 'Error',
          description: 'Anda sudah mengajukan klaim untuk laporan ini',
          variant: 'destructive',
        });
        return null;
      }

      const { data: newClaim, error } = await supabase
        .from('klaim')
        .insert({
          laporan_ditemukan_id: data.laporan_ditemukan_id,
          user_id_klaim: user.id,
          bukti_tambahan: data.bukti_tambahan,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Berhasil',
        description: 'Klaim berhasil diajukan',
      });

      return newClaim;
    } catch (error) {
      console.error('Error creating claim:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengajukan klaim',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createClaim, loading };
}

export function useUpdateClaimStatus() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const updateStatus = async (id: number, status: 'Menunggu' | 'Disetujui' | 'Ditolak') => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('klaim')
        .update({ status_klaim: status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Berhasil',
        description: 'Status klaim diperbarui',
      });

      return true;
    } catch (error) {
      console.error('Error updating claim status:', error);
      toast({
        title: 'Error',
        description: 'Gagal memperbarui status klaim',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { updateStatus, loading };
}
