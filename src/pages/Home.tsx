import { useState } from 'react';
import { Header } from '@/components/common/Header';
import { ReportCard } from '@/components/common/ReportCard';
import { ReportFilters } from '@/components/common/ReportFilters';
import { EmptyState } from '@/components/common/EmptyState';
import { PageLoading } from '@/components/common/LoadingSpinner';
import { useReports } from '@/hooks/useReports';
import type { LaporanFilters } from '@/lib/types';
import { Search } from 'lucide-react';

export default function Home() {
  const [filters, setFilters] = useState<LaporanFilters>({});
  const { laporan: reports, loading } = useReports(filters);

  const handleSearch = (query: string) => {
    setFilters((prev) => ({ ...prev, search: query }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={handleSearch} />

      <main className="container px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Lost & Found Kampus</h1>
          <p className="text-muted-foreground">
            Temukan barang yang hilang atau laporkan barang yang Anda temukan
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <ReportFilters filters={filters} onFilterChange={setFilters} />
        </div>

        {/* Reports Grid */}
        {loading ? (
          <PageLoading />
        ) : !reports || reports.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Tidak ada laporan"
            description="Belum ada laporan yang sesuai dengan filter Anda. Coba ubah filter atau buat laporan baru."
            actionLabel="Buat Laporan"
            actionHref="/lapor"
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {reports.map((laporanItem) => (
                <ReportCard key={laporanItem.id} laporan={laporanItem} />
              ))}
          </div>
        )}
      </main>
    </div>
  );
}
