import { useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { X, Star, GripVertical, Upload } from 'lucide-react';

export interface UploadableImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  uploading?: boolean;
}

/**
 * Uploader de múltiplas imagens com preview, remoção, reordenação (drag) e
 * escolha de imagem principal (Seção 23).
 *
 * IMPORTANTE: `onChange` precisa ser o setState real do componente pai
 * (ex: `setImages`), não um wrapper que recalcula a partir de uma cópia da
 * lista. Uploads acontecem em paralelo (Promise.all) — se cada atualização
 * partisse de uma cópia "congelada" da lista capturada no início do upload,
 * a última chamada a terminar sobrescreveria o resultado das anteriores e a
 * imagem recém-enviada podia sumir do formulário antes de salvar, mesmo já
 * estando no Storage. Usar sempre `onChange(current => ...)` com o setState
 * de verdade garante que cada atualização opera sobre o estado mais recente.
 */
export function ImageUploader({
  images,
  onChange,
  onUpload,
}: {
  images: UploadableImage[];
  onChange: Dispatch<SetStateAction<UploadableImage[]>>;
  onUpload: (file: File) => Promise<string>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    const fileArray = Array.from(files);
    const tempIds = fileArray.map((_, i) => `temp-${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`);

    onChange(current => [
      ...current,
      ...fileArray.map((f, i) => ({
        id: tempIds[i],
        url: URL.createObjectURL(f),
        alt: '',
        isPrimary: current.length === 0 && i === 0,
        uploading: true,
      })),
    ]);

    await Promise.all(
      fileArray.map(async (file, i) => {
        const tempId = tempIds[i];
        try {
          const url = await onUpload(file);
          onChange(current => current.map(img => (img.id === tempId ? { ...img, url, uploading: false } : img)));
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Falha ao enviar uma ou mais imagens. Verifique a conexão com o Supabase Storage.');
          onChange(current => current.filter(img => img.id !== tempId));
        }
      })
    );
  }

  function removeImage(id: string) {
    onChange(current => {
      const next = current.filter(img => img.id !== id);
      if (next.length > 0 && !next.some(i => i.isPrimary)) next[0] = { ...next[0], isPrimary: true };
      return next;
    });
  }

  function setPrimary(id: string) {
    onChange(current => current.map(img => ({ ...img, isPrimary: img.id === id })));
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return;
    onChange(current => {
      const next = [...current];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDragIndex(null);
  }

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {images.map((img, i) => (
          <div
            key={img.id}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={e => e.preventDefault()}
            onDrop={() => handleDrop(i)}
            className="relative aspect-square rounded-sm overflow-hidden bg-ink-900 border border-ink-700 group"
          >
            <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
            {img.uploading && (
              <div className="absolute inset-0 bg-ink-950/70 flex items-center justify-center text-xs">Enviando…</div>
            )}
            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-b from-ink-950/80 to-transparent">
              <GripVertical size={14} className="cursor-grab" />
              <button type="button" onClick={() => removeImage(img.id)} aria-label="Remover imagem">
                <X size={14} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setPrimary(img.id)}
              className={`absolute bottom-1 left-1 px-1.5 py-0.5 rounded-sm text-[10px] flex items-center gap-1 ${
                img.isPrimary ? 'bg-signal-500 text-ink-950' : 'bg-ink-950/70 opacity-0 group-hover:opacity-100'
              }`}
            >
              <Star size={10} fill={img.isPrimary ? 'currentColor' : 'none'} /> Principal
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="aspect-square rounded-sm border border-dashed border-ink-600 flex flex-col items-center justify-center gap-1 text-ink-400 hover:border-signal-500 hover:text-signal-400 transition-colors"
        >
          <Upload size={18} />
          <span className="text-[10px]">Adicionar</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
      {error && <p className="text-sale-500 text-xs mt-2">{error}</p>}
    </div>
  );
}
