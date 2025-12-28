import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useImageUpload } from '@/hooks/useImageUpload';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  className?: string;
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const { uploadImage, uploading } = useImageUpload();
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      const url = await uploadImage(file);
      if (url) {
        onChange(url);
      }
    },
    [uploadImage, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleRemove = () => {
    onChange(undefined);
  };

  if (value) {
    return (
      <div className={cn('relative overflow-hidden rounded-lg border', className)}>
        <img src={value} alt="Uploaded" className="h-48 w-full object-cover" />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute right-2 top-2"
          onClick={handleRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
        dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50',
        uploading && 'pointer-events-none opacity-60',
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="absolute inset-0 cursor-pointer opacity-0"
        onChange={handleInputChange}
        disabled={uploading}
      />
      
      {uploading ? (
        <>
          <Loader2 className="mb-2 h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Mengunggah...</p>
        </>
      ) : (
        <>
          <div className="mb-4 rounded-full bg-muted p-3">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mb-1 text-sm font-medium">Seret & lepas gambar di sini</p>
          <p className="text-xs text-muted-foreground">atau klik untuk memilih file</p>
          <p className="mt-2 text-xs text-muted-foreground">JPG, PNG, WebP, GIF (Max 5MB)</p>
        </>
      )}
    </div>
  );
}
