// Enums matching database
export type AppRole = 'admin' | 'mahasiswa' | 'staff';
export type JenisLaporan = 'Hilang' | 'Ditemukan';
export type StatusLaporan = 'Menunggu' | 'Verifikasi' | 'Dikembalikan' | 'Selesai';
export type StatusKlaim = 'Menunggu' | 'Disetujui' | 'Ditolak';

// Database types
export interface Profile {
  id: string;
  email: string | null;
  nama_lengkap: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Category {
  id: number;
  nama_kategori: string;
}

export interface Laporan {
  id: number;
  user_id: string;
  kategori_id: number;
  jenis_laporan: JenisLaporan;
  judul_barang: string;
  deskripsi: string;
  lokasi_kejadian: string;
  tanggal_kejadian: string;
  gambar_url: string | null;
  status: StatusLaporan;
  created_at: string;
  updated_at: string;
  // Joined fields
  category?: Category;
  profile?: Profile;
}

export interface Klaim {
  id: number;
  laporan_ditemukan_id: number;
  user_id_klaim: string;
  bukti_tambahan: string | null;
  status_klaim: StatusKlaim;
  created_at: string;
  updated_at: string;
  // Joined fields
  laporan?: Laporan;
  profile?: Profile;
}

// Form types
export interface LaporanFormData {
  jenis_laporan: JenisLaporan;
  judul_barang: string;
  deskripsi: string;
  lokasi_kejadian: string;
  tanggal_kejadian: string;
  kategori_id: number;
  gambar_url?: string;
}

export interface KlaimFormData {
  laporan_ditemukan_id: number;
  bukti_tambahan: string;
}

// Filter types
export interface LaporanFilters {
  jenis_laporan?: JenisLaporan | 'Semua';
  kategori_id?: number;
  lokasi?: string;
  search?: string;
}
