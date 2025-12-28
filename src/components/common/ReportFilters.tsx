import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCategories } from '@/hooks/useReports';
import type { LaporanFilters, JenisLaporan } from '@/lib/types';

interface ReportFiltersProps {
  filters: LaporanFilters;
  onFilterChange: (filters: LaporanFilters) => void;
}

export function ReportFilters({ filters, onFilterChange }: ReportFiltersProps) {
  const { categories } = useCategories();

  const handleJenisChange = (value: string) => {
    onFilterChange({
      ...filters,
      jenis_laporan: value as JenisLaporan | 'Semua',
    });
  };

  const handleKategoriChange = (value: string) => {
    onFilterChange({
      ...filters,
      kategori_id: value === 'all' ? undefined : parseInt(value),
    });
  };

  const handleReset = () => {
    onFilterChange({});
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span className="hidden sm:inline">Filter:</span>
      </div>

      <Select value={filters.jenis_laporan || 'Semua'} onValueChange={handleJenisChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Jenis" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Semua">Semua Jenis</SelectItem>
          <SelectItem value="Hilang">Hilang</SelectItem>
          <SelectItem value="Ditemukan">Ditemukan</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.kategori_id?.toString() || 'all'}
        onValueChange={handleKategoriChange}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Kategori" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Kategori</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id.toString()}>
              {cat.nama_kategori}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {(filters.jenis_laporan || filters.kategori_id) && (
        <Button variant="ghost" size="sm" onClick={handleReset}>
          Reset
        </Button>
      )}
    </div>
  );
}
