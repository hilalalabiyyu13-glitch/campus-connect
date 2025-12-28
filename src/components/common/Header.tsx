import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, LogOut, User, FileText, ClipboardList, Shield } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  onSearch?: (query: string) => void;
  showSearch?: boolean;
}

export function Header({ onSearch, showSearch = true }: HeaderProps) {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Search className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="hidden font-semibold sm:inline-block">Lost & Found</span>
        </Link>

        {/* Desktop Search */}
        {showSearch && (
          <form onSubmit={handleSearch} className="hidden flex-1 px-8 md:flex">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari barang hilang atau ditemukan..."
                className="w-full pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        )}

        {/* Desktop Navigation */}
        <nav className="hidden items-center space-x-4 md:flex">
          {user ? (
            <>
              <Button variant="outline" asChild>
                <Link to="/lapor">Buat Laporan</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{profile?.nama_lengkap || 'Pengguna'}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/laporan-saya" className="flex cursor-pointer items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      Laporan Saya
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/klaim-saya" className="flex cursor-pointer items-center">
                      <ClipboardList className="mr-2 h-4 w-4" />
                      Klaim Saya
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex cursor-pointer items-center">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild>
              <Link to="/auth">Masuk</Link>
            </Button>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t bg-background p-4 md:hidden">
          {showSearch && (
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari barang..."
                  className="w-full pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          )}
          <nav className="flex flex-col space-y-2">
            {user ? (
              <>
                <Button variant="outline" asChild className="justify-start">
                  <Link to="/lapor" onClick={() => setMobileMenuOpen(false)}>
                    Buat Laporan
                  </Link>
                </Button>
                <Button variant="ghost" asChild className="justify-start">
                  <Link to="/laporan-saya" onClick={() => setMobileMenuOpen(false)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Laporan Saya
                  </Link>
                </Button>
                <Button variant="ghost" asChild className="justify-start">
                  <Link to="/klaim-saya" onClick={() => setMobileMenuOpen(false)}>
                    <ClipboardList className="mr-2 h-4 w-4" />
                    Klaim Saya
                  </Link>
                </Button>
                {isAdmin && (
                  <Button variant="ghost" asChild className="justify-start">
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="justify-start text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar
                </Button>
              </>
            ) : (
              <Button asChild>
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  Masuk
                </Link>
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
