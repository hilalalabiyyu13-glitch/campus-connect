import { Link } from 'react-router-dom';
import { Header } from '@/components/common/Header';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { PageLoading } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUserReports } from '@/hooks/useReports';
import { FileText, Plus, MapPin, Calendar } from 'lucide-react';

export default function MyReports() {
  const { laporan: reports, loading } = useUserReports();

  return (
    <div className="min-h-screen bg-background">
      <Header showSearch={false} />

      <main className="container px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Laporan Saya</h1>
          <Button asChild>
            <Link to="/lapor">
              <Plus className="mr-2 h-4 w-4" />
              Buat Laporan
            </Link>
          </Button>
        </div>

        {loading ? (
          <PageLoading />
        ) : (!reports || reports.length === 0) ? (
          <EmptyState
            icon={FileText}
            title="Belum ada laporan"
            description="Anda belum membuat laporan apapun. Buat laporan pertama Anda sekarang."
            actionLabel="Buat Laporan"
            actionHref="/lapor"
          />
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id} className="overflow-hidden">
                <CardContent className="flex gap-4 p-4">
                  {/* Image */}
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                    {report.gambar_url ? (
                      <img
                        src={report.gambar_url}
                        alt={report.judul_barang}
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
                        <StatusBadge status={report.jenis_laporan} />
                        <StatusBadge status={report.status} />
                      </div>
                      <h3 className="font-semibold">{report.judul_barang}</h3>
                      <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <MapPin className="mr-1 h-3 w-3" />
                          {report.lokasi_kejadian}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {new Date(report.tanggal_kejadian).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/laporan/${report.id}`}>Detail</Link>
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
