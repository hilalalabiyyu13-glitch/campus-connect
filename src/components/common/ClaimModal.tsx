import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCreateClaim } from '@/hooks/useClaims';
import { Loader2, Send } from 'lucide-react';
import { z } from 'zod';

const claimSchema = z.object({
  bukti_tambahan: z.string().min(10, 'Deskripsi bukti minimal 10 karakter'),
  kontak_telepon: z.string().min(10, 'Nomor telepon minimal 10 digit').max(15, 'Nomor telepon maksimal 15 digit'),
  alasan_klaim: z.string().min(20, 'Alasan klaim minimal 20 karakter'),
});

type ClaimFormData = z.infer<typeof claimSchema>;

interface ClaimModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  laporanId: number;
  judulBarang: string;
}

export function ClaimModal({ open, onOpenChange, laporanId, judulBarang }: ClaimModalProps) {
  const { createClaim, loading } = useCreateClaim();
  const form = useForm<ClaimFormData>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      bukti_tambahan: '',
      kontak_telepon: '',
      alasan_klaim: '',
    },
  });

  const handleSubmit = async (data: ClaimFormData) => {
    const result = await createClaim({
      laporan_ditemukan_id: laporanId,
      bukti_tambahan: data.bukti_tambahan,
      kontak_telepon: data.kontak_telepon,
      alasan_klaim: data.alasan_klaim,
    });

    if (result) {
      onOpenChange(false);
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Klaim Barang
          </DialogTitle>
          <DialogDescription>
            Ajukan klaim untuk barang: <span className="font-semibold">{judulBarang}</span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="bukti_tambahan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bukti Kepemilikan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Deskripsikan ciri-ciri barang yang membuktikan ini milik Anda (contoh: ada goresan di bagian sisi kiri, sticker tertentu, dll)"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="kontak_telepon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Telepon</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="08xx-xxxx-xxxx"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="alasan_klaim"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alasan Klaim</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Jelaskan secara detail mengapa Anda yakin barang ini milik Anda, kapan dan di mana Anda kehilangannya"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="flex-1"
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ajukan Klaim
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}