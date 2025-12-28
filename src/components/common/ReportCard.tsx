import { Link } from 'react-router-dom';
import { MapPin, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import type { Laporan } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface ReportCardProps {
  report: Laporan;
}

export function ReportCard({ report }: ReportCardProps) {
  const timeAgo = formatDistanceToNow(new Date(report.created_at), {
    addSuffix: true,
    locale: id,
  });

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-md">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {report.gambar_url ? (
          <img
            src={report.gambar_url}
            alt={report.judul_barang}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <span className="text-4xl">📦</span>
          </div>
        )}
        <div className="absolute left-2 top-2">
          <StatusBadge status={report.jenis_laporan} />
        </div>
      </div>

      <CardContent className="p-4">
        {/* Category */}
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {report.category?.nama_kategori}
        </p>

        {/* Title */}
        <h3 className="mb-2 line-clamp-1 font-semibold">{report.judul_barang}</h3>

        {/* Location */}
        <div className="mb-1 flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-1.5 h-3.5 w-3.5" />
          <span className="line-clamp-1">{report.lokasi_kejadian}</span>
        </div>

        {/* Date */}
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="mr-1.5 h-3.5 w-3.5" />
          <span>{new Date(report.tanggal_kejadian).toLocaleDateString('id-ID')}</span>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t px-4 py-3">
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="mr-1 h-3 w-3" />
          {timeAgo}
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link to={`/laporan/${report.id}`}>Lihat Detail</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
