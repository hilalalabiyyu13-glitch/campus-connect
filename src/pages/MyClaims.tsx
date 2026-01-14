import { Link } from 'react-router-dom';
import { Header } from '@/components/common/Header';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { PageLoading } from '@/components/common/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserClaims } from '@/hooks/useClaims';
import { ClipboardList, MapPin, Calendar } from 'lucide-react';

export default function MyClaims() {
  const { claims, loading } = useUserClaims();

  return (
    <div className="min-h-screen bg-background">
      <Header showSearch={false} />

      <main className="container px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Klaim Saya</h1>

        {loading ? (
          <PageLoading />
        ) : claims.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Belum ada klaim"
            description="Anda belum mengajukan klaim apapun. Cari barang yang Anda hilangkan di halaman utama."
            actionLabel="Cari Barang"
            actionHref="/"
          />
        ) : (
          <div className="space-y-4">
            {claims.map((claim) => (
              <Card key={claim.id} className="overflow-hidden">
                <CardContent className="flex gap-4 p-4">
                  {/* Image */}
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                    {claim.laporan?.gambar_url ? (
                      <img
                        src={claim.laporan.gambar_url}
                        alt={claim.laporan.judul_barang}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl">📦</div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <StatusBadge status={claim.status_klaim} />
                        {claim.laporan?.status && (
                          <span className="text-xs text-muted-foreground">
                            Status barang: <StatusBadge status={claim.laporan.status} />
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold">{claim.laporan?.judul_barang}</h3>
                      <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <MapPin className="mr-1 h-3 w-3" />
                          {claim.laporan?.lokasi_kejadian}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          Diajukan {new Date(claim.dibuat_pada).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      {claim.bukti_tambahan && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          <p className="font-medium">Bukti klaim:</p>
                          <p className="line-clamp-2">{claim.bukti_tambahan.split('|')[0]}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/laporan/${claim.laporan_ditemukan_id}`}>Detail</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
