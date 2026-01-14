import { useState } from 'react';
import { Header } from '@/components/common/Header';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PageLoading } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useReports, useUpdateReportStatus } from '@/hooks/useReports';
import { useAllClaims, useUpdateClaimStatus } from '@/hooks/useClaims';
import { Link } from 'react-router-dom';
import { Eye, FileText, ClipboardList, Users } from 'lucide-react';

export default function AdminDashboard() {
  const { reports, loading: reportsLoading } = useReports();
  const { claims, loading: claimsLoading } = useAllClaims();
  const { updateStatus: updateReportStatus } = useUpdateReportStatus();
  const { updateStatus: updateClaimStatus } = useUpdateClaimStatus();

  const pendingReports = reports.filter((r) => r.status === 'Menunggu');
  const pendingClaims = claims.filter((c) => c.status_klaim === 'Menunggu');

  const handleReportStatusChange = async (id: number, status: string) => {
    await updateReportStatus(id, status as 'Menunggu' | 'Verifikasi' | 'Dikembalikan' | 'Selesai');
  };

  const handleClaimStatusChange = async (id: number, status: string) => {
    await updateClaimStatus(id, status as 'Menunggu' | 'Disetujui' | 'Ditolak');
  };

  if (reportsLoading || claimsLoading) return <PageLoading />;

  return (
    <div className="min-h-screen bg-background">
      <Header showSearch={false} />

      <main className="container px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Laporan</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.length}</div>
              <p className="text-xs text-muted-foreground">{pendingReports.length} menunggu verifikasi</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Klaim</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{claims.length}</div>
              <p className="text-xs text-muted-foreground">{pendingClaims.length} menunggu review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Barang Dikembalikan</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reports.filter((r) => r.status === 'Dikembalikan' || r.status === 'Selesai').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="reports">
          <TabsList>
            <TabsTrigger value="reports">Laporan ({reports.length})</TabsTrigger>
            <TabsTrigger value="claims">Klaim ({claims.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Barang</TableHead>
                      <TableHead>Jenis</TableHead>
                      <TableHead>Lokasi</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.slice(0, 20).map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-mono text-sm">#{report.id}</TableCell>
                        <TableCell className="max-w-[200px] truncate font-medium">{report.judul_barang}</TableCell>
                        <TableCell><StatusBadge status={report.jenis_laporan} /></TableCell>
                        <TableCell className="max-w-[150px] truncate">{report.lokasi_kejadian}</TableCell>
                        <TableCell>
                          <Select
                            value={report.status}
                            onValueChange={(v) => handleReportStatusChange(report.id, v)}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Menunggu">Menunggu</SelectItem>
                              <SelectItem value="Verifikasi">Verifikasi</SelectItem>
                              <SelectItem value="Dikembalikan">Dikembalikan</SelectItem>
                              <SelectItem value="Selesai">Selesai</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/laporan/${report.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="claims" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Barang</TableHead>
                      <TableHead>Pengaju</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claims.map((claim) => (
                      <TableRow key={claim.id}>
                        <TableCell className="font-mono text-sm">#{claim.id}</TableCell>
                        <TableCell className="max-w-[200px] truncate font-medium">
                          {claim.laporan?.judul_barang}
                        </TableCell>
                        <TableCell>{claim.profil?.nama_lengkap || claim.profil?.email}</TableCell>
                        <TableCell>
                          <Select
                            value={claim.status_klaim}
                            onValueChange={(v) => handleClaimStatusChange(claim.id, v)}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Menunggu">Menunggu</SelectItem>
                              <SelectItem value="Disetujui">Disetujui</SelectItem>
                              <SelectItem value="Ditolak">Ditolak</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/laporan/${claim.laporan_ditemukan_id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
