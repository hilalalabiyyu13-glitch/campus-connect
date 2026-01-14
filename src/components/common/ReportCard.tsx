import { Link } from 'react-router-dom';
import { MapPin, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import type { Laporan } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface ReportCardProps {
  laporan: Laporan;
}

export function ReportCard({ laporan }: ReportCardProps) {
  const timeAgo = formatDistanceToNow(new Date(laporan.dibuat_pada), {
    addSuffix: true,
    locale: id,
  });

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-md">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {laporan.gambar_url ? (
          <img
            src={laporan.gambar_url}
            alt={laporan.judul_barang}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <span className="text-4xl">📦</span>
          </div>
        )}
        <div className="absolute left-2 top-2">
          <StatusBadge status={laporan.jenis_laporan} />
        </div>
      </div>

      <CardContent className="p-4">
        {/* Category */}
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {laporan.kategori?.nama_kategori}
        </p>

        {/* Title */}
        <h3 className="mb-2 line-clamp-1 font-semibold">{laporan.judul_barang}</h3>

        {/* Location */}
        <div className="mb-1 flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-1.5 h-3.5 w-3.5" />
          <span className="line-clamp-1">{laporan.lokasi_kejadian}</span>
        </div>

        {/* Date */}
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="mr-1.5 h-3.5 w-3.5" />
          <span>{new Date(laporan.tanggal_kejadian).toLocaleDateString('id-ID')}</span>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t px-4 py-3">
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="mr-1 h-3 w-3" />
          {timeAgo}
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link to={`/laporan/${laporan.id}`}>Lihat Detail</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
