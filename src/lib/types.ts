// Enums matching database
export type AppRole = 'admin' | 'mahasiswa' | 'staff';
export type JenisLaporan = 'Hilang' | 'Ditemukan';
export type StatusLaporan = 'Menunggu' | 'Verifikasi' | 'Sedang Diklaim' | 'Dikembalikan' | 'Selesai';
export type StatusKlaim = 'Menunggu' | 'Disetujui' | 'Ditolak';

// Database types
export interface Profil {
  id: string;
  email: string | null;
  nama_lengkap: string | null;
  dibuat_pada: string;
  diperbarui_pada: string;
}

export interface UserRole {
  id: string;
  pengguna_id: string;
  peran: AppRole;
  dibuat_pada: string;
}

export interface Kategori {
  id: number;
  nama_kategori: string;
}

export interface Laporan {
  id: number;
  pengguna_id: string;
  kategori_id: number;
  jenis_laporan: JenisLaporan;
  judul_barang: string;
  deskripsi: string;
  lokasi_kejadian: string;
  tanggal_kejadian: string;
  gambar_url: string | null;
  status: StatusLaporan;
  dibuat_pada: string;
  diperbarui_pada: string;
  // Joined fields
  kategori?: Kategori;
  categories?: Kategori;
  profil?: Profil;
}

export interface Klaim {
  id: number;
  laporan_ditemukan_id: number;
  pengguna_id_klaim: string;
  bukti_tambahan: string | null;
  status_klaim: StatusKlaim;
  dibuat_pada: string;
  diperbarui_pada: string;
  // Joined fields
  laporan?: Laporan;
  profil?: Profil;
  claimant?: Profil; // Pengaju klaim
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
  kontak_telepon: string;
  alasan_klaim: string;
}

// Filter types
export interface LaporanFilters {
  jenis_laporan?: JenisLaporan | 'Semua';
  kategori_id?: number;
  lokasi?: string;
  search?: string;
}
