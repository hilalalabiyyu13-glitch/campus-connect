export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      kategori: {
        Row: {
          id: number
          nama_kategori: string
        }
        Insert: {
          id?: number
          nama_kategori: string
        }
        Update: {
          id?: number
          nama_kategori?: string
        }
        Relationships: []
      }
      laporan: {
        Row: {
          id: number
          pengguna_id: string
          kategori_id: number
          jenis_laporan: "Hilang" | "Ditemukan"
          judul_barang: string
          deskripsi: string
          lokasi_kejadian: string
          tanggal_kejadian: string
          gambar_url: string | null
          status: "Menunggu" | "Verifikasi" | "Sedang Diklaim" | "Dikembalikan" | "Selesai"
          dibuat_pada: string
          diperbarui_pada: string
        }
        Insert: {
          id?: number
          pengguna_id: string
          kategori_id: number
          jenis_laporan: "Hilang" | "Ditemukan"
          judul_barang: string
          deskripsi: string
          lokasi_kejadian: string
          tanggal_kejadian: string
          gambar_url?: string | null
          status?: "Menunggu" | "Verifikasi" | "Sedang Diklaim" | "Dikembalikan" | "Selesai"
          dibuat_pada?: string
          diperbarui_pada?: string
        }
        Update: {
          id?: number
          pengguna_id?: string
          kategori_id?: number
          jenis_laporan?: "Hilang" | "Ditemukan"
          judul_barang?: string
          deskripsi?: string
          lokasi_kejadian?: string
          tanggal_kejadian?: string
          gambar_url?: string | null
          status?: "Menunggu" | "Verifikasi" | "Sedang Diklaim" | "Dikembalikan" | "Selesai"
          dibuat_pada?: string
          diperbarui_pada?: string
        }
        Relationships: [
          {
            foreignKeyName: "laporan_kategori_id_fkey"
            columns: ["kategori_id"]
            isOneToOne: false
            referencedRelation: "kategori"
            referencedColumns: ["id"]
          }
        ]
      }
      profil: {
        Row: {
          id: string
          email: string | null
          nama_lengkap: string | null
          dibuat_pada: string
          diperbarui_pada: string
        }
        Insert: {
          id: string
          email?: string | null
          nama_lengkap?: string | null
          dibuat_pada?: string
          diperbarui_pada?: string
        }
        Update: {
          id?: string
          email?: string | null
          nama_lengkap?: string | null
          dibuat_pada?: string
          diperbarui_pada?: string
        }
        Relationships: []
      }
      klaim: {
        Row: {
          id: number
          laporan_ditemukan_id: number
          pengguna_id_klaim: string
          bukti_tambahan: string | null
          status_klaim: "Menunggu" | "Disetujui" | "Ditolak"
          dibuat_pada: string
          diperbarui_pada: string
        }
        Insert: {
          id?: number
          laporan_ditemukan_id: number
          pengguna_id_klaim: string
          bukti_tambahan?: string | null
          status_klaim?: "Menunggu" | "Disetujui" | "Ditolak"
          dibuat_pada?: string
          diperbarui_pada?: string
        }
        Update: {
          id?: number
          laporan_ditemukan_id?: number
          pengguna_id_klaim?: string
          bukti_tambahan?: string | null
          status_klaim?: "Menunggu" | "Disetujui" | "Ditolak"
          dibuat_pada?: string
          diperbarui_pada?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          pengguna_id: string
          peran: "admin" | "mahasiswa" | "staff"
          dibuat_pada: string
        }
        Insert: {
          id?: string
          pengguna_id: string
          peran?: "admin" | "mahasiswa" | "staff"
          dibuat_pada?: string
        }
        Update: {
          id?: string
          pengguna_id?: string
          peran?: "admin" | "mahasiswa" | "staff"
          dibuat_pada?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _pengguna_id: string }
        Returns: "admin" | "mahasiswa" | "staff"
      }
      has_role: {
        Args: {
          _peran: "admin" | "mahasiswa" | "staff"
          _pengguna_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "mahasiswa" | "staff"
      jenis_laporan: "Hilang" | "Ditemukan"
      status_klaim: "Menunggu" | "Disetujui" | "Ditolak"
      status_laporan: "Menunggu" | "Verifikasi" | "Sedang Diklaim" | "Dikembalikan" | "Selesai"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  TableName extends keyof Database["public"]["Tables"],
> = Database["public"]["Tables"][TableName]["Row"]

export type TablesInsert<
  TableName extends keyof Database["public"]["Tables"],
> = Database["public"]["Tables"][TableName]["Insert"]

export type TablesUpdate<
  TableName extends keyof Database["public"]["Tables"],
> = Database["public"]["Tables"][TableName]["Update"]

export type Enums<
  EnumName extends keyof Database["public"]["Enums"],
> = Database["public"]["Enums"][EnumName]

export const Constants = {
  public: {

    Enums: {
      app_role: ["admin", "mahasiswa", "staff"],
      jenis_laporan: ["Hilang", "Ditemukan"],
      status_klaim: ["Menunggu", "Disetujui", "Ditolak"],
      status_laporan: ["Menunggu", "Verifikasi", "Sedang Diklaim", "Dikembalikan", "Selesai"],
    },
  },
} as const