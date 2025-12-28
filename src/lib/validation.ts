import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export const signupSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  nama_lengkap: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
});

export const laporanSchema = z.object({
  jenis_laporan: z.enum(['Hilang', 'Ditemukan'], {
    required_error: 'Pilih jenis laporan',
  }),
  judul_barang: z.string().min(3, 'Judul minimal 3 karakter').max(100, 'Judul maksimal 100 karakter'),
  deskripsi: z.string().min(10, 'Deskripsi minimal 10 karakter').max(1000, 'Deskripsi maksimal 1000 karakter'),
  lokasi_kejadian: z.string().min(3, 'Lokasi minimal 3 karakter').max(200, 'Lokasi maksimal 200 karakter'),
  tanggal_kejadian: z.string().min(1, 'Tanggal wajib diisi'),
  kategori_id: z.number().min(1, 'Pilih kategori'),
});

export const klaimSchema = z.object({
  bukti_tambahan: z.string().min(20, 'Bukti tambahan minimal 20 karakter').max(1000, 'Bukti maksimal 1000 karakter'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type LaporanFormSchema = z.infer<typeof laporanSchema>;
export type KlaimFormSchema = z.infer<typeof klaimSchema>;
