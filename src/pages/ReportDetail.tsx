import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { Header } from '@/components/common/Header';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ClaimModal } from '@/components/common/ClaimModal';
import { PageLoading } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useReport } from '@/hooks/useReports';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, MapPin, Calendar, User, Send } from 'lucide-react';

export default function ReportDetail() {
  const { id } = useParams();
  const { laporan, loading } = useReport(Number(id));
  const { user } = useAuth();
  const [claimModalOpen, setClaimModalOpen] = useState(false);

  if (loading) return <PageLoading />;
  if (!laporan) return <div className="p-8 text-center">Laporan tidak ditemukan</div>;

  // Validasi: hanya laporan Ditemukan dengan status Menunggu/Verifikasi yang bisa diklaim
  const canClaim = user && 
    laporan.jenis_laporan === 'Ditemukan' && 
    laporan.pengguna_id !== user.id &&
    (laporan.status === 'Menunggu' || laporan.status === 'Verifikasi');

  return (
    <div className="min-h-screen bg-background">
      <Header showSearch={false} />

      <main className="container max-w-4xl px-4 py-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Link>
        </Button>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Image */}
          <div className="overflow-hidden rounded-lg bg-muted">
            {laporan.gambar_url ? (
              <img
                src={laporan.gambar_url}
                alt={laporan.judul_barang}
                className="h-full min-h-[300px] w-full object-cover"
              />
            ) : (
              <div className="flex h-[300px] items-center justify-center text-6xl">📦</div>
            )}
          </div>

          {/* Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <p className="mb-1 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    {laporan.kategori?.nama_kategori}
                  </p>
                  <CardTitle className="text-2xl">{laporan.judul_barang}</CardTitle>
                </div>
                <StatusBadge status={laporan.jenis_laporan} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-muted-foreground">
                <MapPin className="mr-2 h-4 w-4" />
                {laporan.lokasi_kejadian}
              </div>
              <div className="flex items-center text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                {new Date(laporan.tanggal_kejadian).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <div className="flex items-center text-muted-foreground">
                <User className="mr-2 h-4 w-4" />
                Dilaporkan oleh {laporan.profil?.nama_lengkap || 'Anonim'}
              </div>

              <div className="border-t pt-4">
                <h3 className="mb-2 font-semibold">Deskripsi</h3>
                <p className="whitespace-pre-wrap text-muted-foreground">{laporan.deskripsi}</p>
              </div>

              <div className="flex items-center gap-2 border-t pt-4">
                <span className="text-sm text-muted-foreground">Status:</span>
                <StatusBadge status={laporan.status} />
              </div>

              {/* Button Klaim */}
              {canClaim && (
                <Button 
                  onClick={() => setClaimModalOpen(true)} 
                  className="w-full"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Klaim Barang
                </Button>
              )}

              {/* Info jika tidak bisa klaim */}
              {user && laporan.jenis_laporan === 'Ditemukan' && laporan.pengguna_id === user.id && (
                <div className="text-sm text-muted-foreground text-center">
                  Anda tidak bisa mengklaim barang sendiri
                </div>
              )}

              {user && laporan.jenis_laporan === 'Ditemukan' && laporan.pengguna_id !== user.id && 
               (laporan.status !== 'Menunggu' && laporan.status !== 'Verifikasi') && (
                <div className="text-sm text-muted-foreground text-center">
                  Barang ini tidak bisa diklaim saat ini
                </div>
              )}

              {user && laporan.jenis_laporan === 'Hilang' && (
                <div className="text-sm text-muted-foreground text-center">
                  Hanya barang ditemukan yang bisa diklaim
                </div>
              )}

              {!user && laporan.jenis_laporan === 'Ditemukan' && (
                <Button asChild className="w-full" variant="outline">
                  <Link to="/auth">
                    Masuk untuk Mengajukan Klaim
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Claim Modal */}
        <ClaimModal
          open={claimModalOpen}
          onOpenChange={setClaimModalOpen}
          laporanId={laporan.id}
          judulBarang={laporan.judul_barang}
        />
      </main>
    </div>
  );
}