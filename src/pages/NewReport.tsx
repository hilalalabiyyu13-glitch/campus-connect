import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Header } from '@/components/common/Header';
import { ImageUpload } from '@/components/common/ImageUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCategories, useCreateReport } from '@/hooks/useReports';
import { laporanSchema, LaporanFormSchema } from '@/lib/validation';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NewReport() {
  const navigate = useNavigate();
  const { categories } = useCategories();
  const { createReport, loading } = useCreateReport();
  const [imageUrl, setImageUrl] = useState<string | undefined>();

  const form = useForm<LaporanFormSchema>({
    resolver: zodResolver(laporanSchema),
    defaultValues: {
      jenis_laporan: 'Hilang',
      judul_barang: '',
      deskripsi: '',
      lokasi_kejadian: '',
      tanggal_kejadian: new Date().toISOString().split('T')[0],
      kategori_id: 0,
    },
  });

  const onSubmit = async (data: LaporanFormSchema) => {
    const result = await createReport({
      ...data,
      gambar_url: imageUrl,
    });

    if (result) {
      navigate('/laporan-saya');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showSearch={false} />

      <main className="container max-w-2xl px-4 py-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Buat Laporan Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Jenis Laporan */}
                <FormField
                  control={form.control}
                  name="jenis_laporan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Laporan</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Hilang" id="hilang" />
                            <label htmlFor="hilang" className="cursor-pointer text-sm font-medium">
                              Barang Hilang
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Ditemukan" id="ditemukan" />
                            <label htmlFor="ditemukan" className="cursor-pointer text-sm font-medium">
                              Barang Ditemukan
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Judul */}
                <FormField
                  control={form.control}
                  name="judul_barang"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Barang</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Dompet Hitam" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Kategori */}
                <FormField
                  control={form.control}
                  name="kategori_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori</FormLabel>
                      <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kategori" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.nama_kategori}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Deskripsi */}
                <FormField
                  control={form.control}
                  name="deskripsi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Jelaskan ciri-ciri barang secara detail..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Lokasi */}
                <FormField
                  control={form.control}
                  name="lokasi_kejadian"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lokasi</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Gedung A Lantai 2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tanggal */}
                <FormField
                  control={form.control}
                  name="tanggal_kejadian"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Kejadian</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Foto Barang (Opsional)</label>
                  <ImageUpload value={imageUrl} onChange={setImageUrl} />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Kirim Laporan
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
