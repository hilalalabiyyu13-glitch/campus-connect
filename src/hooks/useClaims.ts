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
        .select('*')
        .eq('pengguna_id_klaim', user.id)
        .order('dibuat_pada', { ascending: false });

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
        { event: '*', schema: 'public', table: 'klaim', filter: `pengguna_id_klaim=eq.${user.id}` },
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
        .select('*')
        .order('dibuat_pada', { ascending: false });

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

  const createClaim = async (data: KlaimFormData & { kontak_telepon: string; alasan_klaim: string }) => {
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
      // Check if user already has a pending claim for this item
      const { data: existingClaim } = await supabase
        .from('klaim')
        .select('*')
        .eq('laporan_ditemukan_id', data.laporan_ditemukan_id)
        .eq('pengguna_id_klaim', user.id)
        .eq('status_klaim', 'Menunggu')
        .single();

      if (existingClaim) {
        toast({
          title: 'Error',
          description: 'Anda sudah pernah mengajukan klaim untuk barang ini',
          variant: 'destructive',
        });
        return null;
      }

      // Check if the report can be claimed (only "Menunggu" or "Verifikasi" status)
      const { data: report } = await supabase
        .from('laporan')
        .select('status, pengguna_id, jenis_laporan')
        .eq('id', data.laporan_ditemukan_id)
        .single();

      if (!report) {
        toast({
          title: 'Error',
          description: 'Laporan tidak ditemukan',
          variant: 'destructive',
        });
        return null;
      }

      // Validate: cannot claim own report
      if (report.pengguna_id === user.id) {
        toast({
          title: 'Error',
          description: 'Anda tidak bisa mengklaim barang sendiri',
          variant: 'destructive',
        });
        return null;
      }

      // Validate: only "Ditemukan" reports can be claimed
      if (report.jenis_laporan !== 'Ditemukan') {
        toast({
          title: 'Error',
          description: 'Hanya barang ditemukan yang bisa diklaim',
          variant: 'destructive',
        });
        return null;
      }

      // Validate: status must be "Menunggu" or "Verifikasi"
      if (report.status !== 'Menunggu' && report.status !== 'Verifikasi') {
        toast({
          title: 'Error',
          description: 'Barang ini tidak bisa diklaim saat ini',
          variant: 'destructive',
        });
        return null;
      }

      // Combine claim data
      const buktiCombined = `${data.bukti_tambahan}|${data.kontak_telepon}|${data.alasan_klaim}`;

      const { data: newClaim, error } = await supabase
        .from('klaim')
        .insert({
          laporan_ditemukan_id: data.laporan_ditemukan_id,
          pengguna_id_klaim: user.id,
          bukti_tambahan: buktiCombined,
          status_klaim: 'Menunggu',
        })
        .select()
        .single();

      if (error) throw error;

      // Update report status to "Sedang Diklaim"
      const { error: updateError } = await supabase
        .from('laporan')
        .update({ status: 'Sedang Diklaim' })
        .eq('id', data.laporan_ditemukan_id);

      if (updateError) throw updateError;

      // Get report details for notification
      const { data: reportDetails } = await supabase
        .from('laporan')
        .select('judul_barang, pengguna_id')
        .eq('id', data.laporan_ditemukan_id)
        .single();

      // Send notification to report creator (if different user)
      if (reportDetails && reportDetails.pengguna_id !== user.id) {
        // TODO: Implement notification system
        console.log('Notifikasi ke pembuat laporan:', reportDetails.pengguna_id);
        console.log('Barang:', reportDetails.judul_barang, 'diklaim oleh:', user.id);
      }

      toast({
        title: 'Berhasil',
        description: 'Klaim Anda telah diajukan dan menunggu verifikasi',
      });

      return newClaim;
    } catch (error) {
      console.error('Error creating claim:', error);
      toast({
        title: 'Error',
        description: 'Gagal membuat klaim',
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
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const updateStatus = async (id: number, status: 'Menunggu' | 'Disetujui' | 'Ditolak') => {
    setLoading(true);
    try {
      // Get claim details to check permissions and update report status
      const { data: claim } = await supabase
        .from('klaim')
        .select('laporan_ditemukan_id')
        .eq('id', id)
        .single();

      // Get report details separately to check ownership
      const { data: report } = await supabase
        .from('laporan')
        .select('pengguna_id')
        .eq('id', claim?.laporan_ditemukan_id || 0)
        .single();

      if (!claim) throw new Error('Klaim tidak ditemukan');

      // Check if user is admin or report owner
      const isAdmin = user?.email?.includes('admin') || false; // TODO: Check actual admin role properly
      const isReportOwner = report?.pengguna_id === user?.id;

      if (!isAdmin && !isReportOwner) {
        throw new Error('Anda tidak memiliki hak untuk mengubah status klaim ini');
      }

      // Update claim status
      const { error } = await supabase
        .from('klaim')
        .update({ status_klaim: status })
        .eq('id', id);

      if (error) throw error;

      // Update report status based on claim result
      const newReportStatus = status === 'Disetujui' ? 'Selesai' : 'Menunggu';
      const { error: updateError } = await supabase
        .from('laporan')
        .update({ status: newReportStatus })
        .eq('id', claim.laporan_ditemukan_id);

      if (updateError) throw updateError;

      const actionText = isAdmin 
        ? `Admin ${status === 'Disetujui' ? 'menyetujui' : status === 'Ditolak' ? 'menolak' : 'memperbarui'}`
        : `Pemilik barang ${status === 'Disetujui' ? 'menyetujui' : status === 'Ditolak' ? 'menolak' : 'memperbarui'}`;

      toast({
        title: 'Berhasil',
        description: `${actionText} klaim`,
      });

      return true;
    } catch (error) {
      console.error('Error updating claim status:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal memperbarui status klaim',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { updateStatus, loading };
}
