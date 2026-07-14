import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  title?: string;
  showBack?: boolean;
  backTo?: string;
  children: React.ReactNode;
  className?: string;
  headerRight?: React.ReactNode;
}

export default function PageContainer({ title, showBack = false, children, className, headerRight }: PageContainerProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-warm-50 to-warm-100">
      {(title || showBack) && (
        <header className="sticky top-0 z-40 flex items-center h-14 px-4 bg-white/80 backdrop-blur-md border-b border-warm-100">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full text-gray-600 hover:bg-warm-100 active:bg-warm-200 transition-colors"
            >
              <ArrowLeft size={20} strokeWidth={2.5} />
            </button>
          )}
          {title && (
            <h1 className={cn('flex-1 text-lg font-semibold text-gray-800', showBack ? 'text-center pr-10' : '')}>
              {title}
            </h1>
          )}
          {headerRight ? (
            <div className="w-auto min-w-[40px] flex items-center justify-end">
              {headerRight}
            </div>
          ) : (
            !showBack && title && <div className="w-10" />
          )}
        </header>
      )}
      <main className={cn('flex-1 overflow-y-auto pb-24 scrollbar-hide', className)}>
        {children}
      </main>
    </div>
  );
}
