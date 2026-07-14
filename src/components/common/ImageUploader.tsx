import { useRef } from 'react';
import { Camera, ImagePlus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const MAX_W = 800;
        const MAX_H = 800;
        let { width, height } = img;
        if (width > MAX_W || height > MAX_H) {
          const ratio = Math.min(MAX_W / width, MAX_H / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ImageUploader({ images, onChange, max = 6 }: ImageUploaderProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const newImages: string[] = [];
    for (let i = 0; i < files.length && images.length + newImages.length < max; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      try {
        const base64 = await fileToBase64(file);
        newImages.push(base64);
      } catch {
        // skip failed images
      }
    }
    if (newImages.length > 0) {
      onChange([...images, ...newImages]);
    }
    // reset inputs
    if (cameraRef.current) cameraRef.current.value = '';
    if (fileRef.current) fileRef.current.value = '';
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {/* 拍照按钮 */}
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all',
            'bg-sky-50 text-sky-600 hover:bg-sky-100 active:scale-95'
          )}
        >
          <Camera size={16} />
          拍照
        </button>

        {/* 上传图片按钮 */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all',
            'bg-cyan-50 text-cyan-600 hover:bg-cyan-100 active:scale-95'
          )}
        >
          <ImagePlus size={16} />
          选图片
        </button>

        {images.length > 0 && (
          <span className="text-xs text-gray-400 self-center ml-auto">
            {images.length}/{max}
          </span>
        )}
      </div>

      {/* 隐藏的 input */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* 图片预览 */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((src, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
              <img
                src={src}
                alt={`图片 ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {images.length < max && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300 hover:border-sky-300 hover:text-sky-400 transition-colors"
            >
              <ImagePlus size={24} />
              <span className="text-[10px] mt-1">添加</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
