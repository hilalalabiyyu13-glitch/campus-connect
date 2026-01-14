import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Laporan, LaporanFilters, LaporanFormData, Kategori } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useReports(filters?: LaporanFilters) {
  const [laporan, setReports] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReports = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('laporan')
        .select('*');

      if (filters?.jenis_laporan && filters.jenis_laporan !== 'Semua') {
        query = query.eq('jenis_laporan', filters.jenis_laporan);
      }

      if (filters?.kategori_id) {
        query = query.eq('kategori_id', filters.kategori_id);
      }

      if (filters?.lokasi) {
        query = query.ilike('lokasi_kejadian', `%${filters.lokasi}%`);
      }

      if (filters?.search) {
        query = query.or(`judul_barang.ilike.%${filters.search}%,deskripsi.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setReports((data || []) as unknown as Laporan[]);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat laporan',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filters?.jenis_laporan, filters?.kategori_id, filters?.lokasi, filters?.search]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('laporan-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'laporan' },
        () => {
          fetchReports();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { laporan, loading, refetch: fetchReports };
}

export function useUserReports() {
  const { user } = useAuth();
  const [laporan, setReports] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReports = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('laporan')
        .select('*')
        .eq('pengguna_id', user.id)
        .order('dibuat_pada', { ascending: false });

      if (error) throw error;

      setReports((data || []) as unknown as Laporan[]);
    } catch (error) {
      console.error('Error fetching user reports:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat laporan Anda',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [user]);

  return { laporan, loading, refetch: fetchReports };
}

export function useReport(id: number) {
  const [laporan, setReport] = useState<Laporan | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const { data, error } = await supabase
          .from('laporan')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        setReport(data as unknown as Laporan);
      } catch (error) {
        console.error('Error fetching report:', error);
        toast({
          title: 'Error',
          description: 'Gagal memuat detail laporan',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReport();
    }
  }, [id]);

  return { laporan, loading };
}

export function useCategories() {
  const [categories, setCategories] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('kategori')
          .select('*');

        if (error) throw error;

        setCategories((data || []) as Kategori[]);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading };
}

export function useCreateReport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createReport = async (data: LaporanFormData) => {
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
      const { data: newReport, error } = await supabase
        .from('laporan')
        .insert({
          pengguna_id: user.id,
          kategori_id: data.kategori_id,
          jenis_laporan: data.jenis_laporan,
          judul_barang: data.judul_barang,
          deskripsi: data.deskripsi,
          lokasi_kejadian: data.lokasi_kejadian,
          tanggal_kejadian: data.tanggal_kejadian,
          gambar_url: data.gambar_url || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Berhasil',
        description: 'Laporan berhasil dibuat',
      });

      return newReport;
    } catch (error) {
      console.error('Error creating report:', error);
      toast({
        title: 'Error',
        description: 'Gagal membuat laporan',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createReport, loading };
}

export function useUpdateReportStatus() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const updateStatus = async (id: number, status: 'Menunggu' | 'Verifikasi' | 'Dikembalikan' | 'Selesai') => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('laporan')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Berhasil',
        description: 'Status laporan diperbarui',
      });

      return true;
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Gagal memperbarui status',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { updateStatus, loading };
}
