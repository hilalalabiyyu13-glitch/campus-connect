import { useState, useEffect } from 'react';
import { Header } from '@/components/common/Header';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PageLoading } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useUserReports } from '@/hooks/useReports';
import { useUpdateClaimStatus } from '@/hooks/useClaims';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Users, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import type { Klaim } from '@/lib/types';

// Custom hook untuk mendapatkan klaim pada laporan user
function useClaimsOnMyReports() {
  const { user } = useAuth();
  const [claims, setClaims] = useState<Klaim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClaimsOnMyReports = async () => {
      if (!user) {
        setClaims([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // Query sederhana: dapatkan semua klaim
        const { data: claimsData, error } = await supabase
          .from('klaim')
          .select('*')
          .order('dibuat_pada', { ascending: false });
        
        if (error) throw error;
        
        // Filter manual: hanya klaim pada laporan milik user
        const userReports = await supabase
          .from('laporan')
          .select('id')
          .eq('pengguna_id', user.id);
        
        const reportIds = userReports.data?.map(r => r.id) || [];
        const filteredClaims = claimsData?.filter(claim => 
          reportIds.includes(claim.laporan_ditemukan_id)
        ) || [];
        
        setClaims(filteredClaims);
      } catch (error) {
        console.error('Error fetching claims on my reports:', error);
        setClaims([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClaimsOnMyReports();
  }, [user]);

  return { claims, loading };
}

export default function MyReportClaims() {
  const { user } = useAuth();
  const { laporan: reports, loading: reportsLoading } = useUserReports();
  const { claims, loading } = useClaimsOnMyReports();
  const { updateStatus } = useUpdateClaimStatus();

  const pendingClaims = claims.filter((c) => c.status_klaim === 'Menunggu');
  const approvedClaims = claims.filter((c) => c.status_klaim === 'Disetujui');
  const rejectedClaims = claims.filter((c) => c.status_klaim === 'Ditolak');

  const handleClaimAction = async (claimId: number, status: 'Disetujui' | 'Ditolak') => {
    await updateStatus(claimId, status);
    // Refresh data
    window.location.reload();
  };

  if (reportsLoading || loading) return <PageLoading />;

  return (
    <div className="min-h-screen bg-background">
      <Header showSearch={false} />

      <main className="container px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Klaim pada Laporan Saya</h1>

        {claims.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Belum ada klaim"
            description="Belum ada yang mengajukan klaim pada barang yang Anda laporkan."
            actionLabel="Lihat Laporan Saya"
            actionHref="/my-reports"
          />
        ) : (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Menunggu Review</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingClaims.length}</div>
                  <p className="text-xs text-muted-foreground">Perlu persetujuan Anda</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Disetujui</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{approvedClaims.length}</div>
                  <p className="text-xs text-muted-foreground">Klaim disetujui</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
                  <XCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{rejectedClaims.length}</div>
                  <p className="text-xs text-muted-foreground">Klaim ditolak</p>
                </CardContent>
              </Card>
            </div>

            {/* Claims List */}
            <Card>
              <CardHeader>
                <CardTitle>Daftar Klaim</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Barang yang Diklaim</TableHead>
                      <TableHead>Pengaju Klaim</TableHead>
                      <TableHead>Bukti</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claims.map((claim) => (
                      <TableRow key={claim.id}>
                        <TableCell className="font-mono text-sm">#{claim.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{claim.laporan?.judul_barang || 'Loading...'}</div>
                            <div className="text-sm text-muted-foreground">
                              {claim.laporan?.lokasi_kejadian || 'Loading...'}
                            </div>
                            <div className="mt-1">
                              <StatusBadge status={claim.laporan?.status} />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">Pengaju Klaim</div>
                            <div className="text-muted-foreground">ID: {claim.pengguna_id_klaim}</div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <div className="text-sm line-clamp-2">
                            {claim.bukti_tambahan?.split('|')[0] || '-'}
                          </div>
                          {claim.bukti_tambahan?.includes('|') && (
                            <div className="text-xs text-muted-foreground">
                              Kontak: {claim.bukti_tambahan.split('|')[1] || '-'}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={claim.status_klaim} />
                        </TableCell>
                        <TableCell>
                          {claim.status_klaim === 'Menunggu' ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleClaimAction(claim.id, 'Disetujui')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Setujui
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleClaimAction(claim.id, 'Ditolak')}
                              >
                                <XCircle className="mr-1 h-4 w-4" />
                                Tolak
                              </Button>
                            </div>
                          ) : (
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/laporan/${claim.laporan_ditemukan_id}`}>
                                <Eye className="mr-1 h-4 w-4" />
                                Detail
                              </Link>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}