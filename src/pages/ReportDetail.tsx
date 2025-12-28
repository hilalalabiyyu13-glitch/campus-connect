import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Header } from '@/components/common/Header';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PageLoading } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useReport } from '@/hooks/useReports';
import { useCreateClaim } from '@/hooks/useClaims';
import { useAuth } from '@/context/AuthContext';
import { klaimSchema, KlaimFormSchema } from '@/lib/validation';
import { ArrowLeft, MapPin, Calendar, User, Loader2 } from 'lucide-react';

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { report, loading } = useReport(Number(id));
  const { user } = useAuth();
  const { createClaim, loading: claimLoading } = useCreateClaim();
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);

  const form = useForm<KlaimFormSchema>({
    resolver: zodResolver(klaimSchema),
    defaultValues: { bukti_tambahan: '' },
  });

  const handleClaim = async (data: KlaimFormSchema) => {
    if (!report) return;
    const result = await createClaim({
      laporan_ditemukan_id: report.id,
      bukti_tambahan: data.bukti_tambahan,
    });
    if (result) {
      setClaimDialogOpen(false);
      navigate('/klaim-saya');
    }
  };

  if (loading) return <PageLoading />;
  if (!report) return <div className="p-8 text-center">Laporan tidak ditemukan</div>;

  const canClaim = user && report.jenis_laporan === 'Ditemukan' && report.user_id !== user.id;

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
            {report.gambar_url ? (
              <img
                src={report.gambar_url}
                alt={report.judul_barang}
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
                    {report.category?.nama_kategori}
                  </p>
                  <CardTitle className="text-2xl">{report.judul_barang}</CardTitle>
                </div>
                <StatusBadge status={report.jenis_laporan} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-muted-foreground">
                <MapPin className="mr-2 h-4 w-4" />
                {report.lokasi_kejadian}
              </div>
              <div className="flex items-center text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                {new Date(report.tanggal_kejadian).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <div className="flex items-center text-muted-foreground">
                <User className="mr-2 h-4 w-4" />
                Dilaporkan oleh {report.profile?.nama_lengkap || 'Anonim'}
              </div>

              <div className="border-t pt-4">
                <h3 className="mb-2 font-semibold">Deskripsi</h3>
                <p className="whitespace-pre-wrap text-muted-foreground">{report.deskripsi}</p>
              </div>

              <div className="flex items-center gap-2 border-t pt-4">
                <span className="text-sm text-muted-foreground">Status:</span>
                <StatusBadge status={report.status} />
              </div>

              {canClaim && (
                <Dialog open={claimDialogOpen} onOpenChange={setClaimDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">Ajukan Klaim</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajukan Klaim Barang</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleClaim)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="bukti_tambahan"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bukti Kepemilikan</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Jelaskan bukti bahwa barang ini milik Anda..."
                                  rows={5}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full" disabled={claimLoading}>
                          {claimLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Kirim Klaim
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}

              {!user && (
                <Button asChild className="w-full">
                  <Link to="/auth">Masuk untuk Mengajukan Klaim</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
