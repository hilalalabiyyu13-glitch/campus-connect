import { cn } from '@/lib/utils';
import type { StatusLaporan, StatusKlaim, JenisLaporan } from '@/lib/types';

interface StatusBadgeProps {
  status: StatusLaporan | StatusKlaim | JenisLaporan;
  className?: string;
}

const statusStyles: Record<string, string> = {
  // Jenis Laporan
  Hilang: 'bg-destructive/10 text-destructive border-destructive/20',
  Ditemukan: 'bg-success/10 text-success border-success/20',
  // Status Laporan
  Menunggu: 'bg-warning/10 text-warning border-warning/20',
  Verifikasi: 'bg-primary/10 text-primary border-primary/20',
  Dikembalikan: 'bg-success/10 text-success border-success/20',
  Selesai: 'bg-muted text-muted-foreground border-border',
  // Status Klaim
  Disetujui: 'bg-success/10 text-success border-success/20',
  Ditolak: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        statusStyles[status] || 'bg-muted text-muted-foreground',
        className
      )}
    >
      {status}
    </span>
  );
}
