-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'mahasiswa', 'staff');

-- Create report type enum
CREATE TYPE public.jenis_laporan AS ENUM ('Hilang', 'Ditemukan');

-- Create report status enum
CREATE TYPE public.status_laporan AS ENUM ('Menunggu', 'Verifikasi', 'Sedang Diklaim', 'Dikembalikan', 'Selesai');

-- Create claim status enum
CREATE TYPE public.status_klaim AS ENUM ('Menunggu', 'Disetujui', 'Ditolak');

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pengguna_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  peran app_role NOT NULL DEFAULT 'mahasiswa',
  dibuat_pada TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (pengguna_id, peran)
);

-- Profiles table for user info
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  nama_lengkap TEXT,
  dibuat_pada TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  diperbarui_pada TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Categories table
CREATE TABLE public.categories (
  id SERIAL PRIMARY KEY,
  nama_kategori TEXT NOT NULL UNIQUE
);

-- Insert default categories
INSERT INTO public.categories (nama_kategori) VALUES 
  ('Elektronik'),
  ('Dokumen'),
  ('Kunci'),
  ('Tas'),
  ('Pakaian');

-- Reports table
CREATE TABLE public.laporan (
  id SERIAL PRIMARY KEY,
  pengguna_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  kategori_id INTEGER REFERENCES public.categories(id) NOT NULL,
  jenis_laporan jenis_laporan NOT NULL,
  judul_barang TEXT NOT NULL,
  deskripsi TEXT NOT NULL,
  lokasi_kejadian TEXT NOT NULL,
  tanggal_kejadian DATE NOT NULL,
  gambar_url TEXT,
  status status_laporan NOT NULL DEFAULT 'Menunggu',
  dibuat_pada TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  diperbarui_pada TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Claims table
CREATE TABLE public.klaim (
  id SERIAL PRIMARY KEY,
  laporan_ditemukan_id INTEGER REFERENCES public.laporan(id) ON DELETE CASCADE NOT NULL,
  pengguna_id_klaim UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bukti_tambahan TEXT,
  status_klaim status_klaim NOT NULL DEFAULT 'Menunggu',
  dibuat_pada TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  diperbarui_pada TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laporan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.klaim ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_pengguna_id UUID, _peran app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE pengguna_id = _pengguna_id
      AND peran = _peran
  )
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_pengguna_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT peran
  FROM public.user_roles
  WHERE pengguna_id = _pengguna_id
  LIMIT 1
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = pengguna_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for categories (public read)
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for laporan
CREATE POLICY "Anyone can view reports" ON public.laporan
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reports" ON public.laporan
  FOR INSERT WITH CHECK (auth.uid() = pengguna_id);

CREATE POLICY "Users can update their own reports" ON public.laporan
  FOR UPDATE USING (auth.uid() = pengguna_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete reports" ON public.laporan
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for klaim
CREATE POLICY "Users can view their own claims" ON public.klaim
  FOR SELECT USING (auth.uid() = pengguna_id_klaim OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create claims" ON public.klaim
  FOR INSERT WITH CHECK (auth.uid() = pengguna_id_klaim);

CREATE POLICY "Admins can update claims" ON public.klaim
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Report owners can view claims on their reports" ON public.klaim
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.laporan 
      WHERE laporan.id = klaim.laporan_ditemukan_id 
      AND laporan.pengguna_id = auth.uid()
    )
  );

-- Trigger to create profile and role on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nama_lengkap)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'nama_lengkap', ''));
  
  INSERT INTO public.user_roles (pengguna_id, peran)
  VALUES (NEW.id, 'mahasiswa');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.diperbarui_pada = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_laporan_updated_at
  BEFORE UPDATE ON public.laporan
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_klaim_updated_at
  BEFORE UPDATE ON public.klaim
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for laporan and klaim
ALTER PUBLICATION supabase_realtime ADD TABLE public.laporan;
ALTER PUBLICATION supabase_realtime ADD TABLE public.klaim;

-- Create storage bucket for report images
INSERT INTO storage.buckets (id, name, public) VALUES ('laporan-images', 'laporan-images', true);

-- Storage policies
CREATE POLICY "Anyone can view report images" ON storage.objects
  FOR SELECT USING (bucket_id = 'laporan-images');

CREATE POLICY "Authenticated users can upload report images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'laporan-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'laporan-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own images" ON storage.objects
  FOR DELETE USING (bucket_id = 'laporan-images' AND auth.uid()::text = (storage.foldername(name))[1]);