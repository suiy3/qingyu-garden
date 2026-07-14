import { Home, PlusCircle, Sparkles, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  isCenter?: boolean;
}

const navItems: NavItem[] = [
  { path: '/', label: '首页', icon: <Home size={22} strokeWidth={2} /> },
  { path: '/mood-record', label: '记录', icon: <PlusCircle size={28} strokeWidth={2} />, isCenter: true },
  { path: '/actions', label: '微行动', icon: <Sparkles size={22} strokeWidth={2} /> },
  { path: '/profile', label: '我的', icon: <User size={22} strokeWidth={2} /> },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-soft">
      <div className="flex items-end justify-around h-20 px-2 pb-2">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              'flex flex-col items-center justify-center transition-all duration-200',
              item.isCenter
                ? 'relative -mt-8'
                : 'flex-1 h-16 py-2'
            )}
          >
            {item.isCenter ? (
              <div className="flex flex-col items-center">
                <div className={cn(
                  'flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-lg shadow-orange-200/50 transition-transform active:scale-95',
                  isActive(item.path) && 'scale-105'
                )}>
                  {item.icon}
                </div>
                <span className={cn(
                  'mt-1 text-xs font-medium',
                  isActive(item.path) ? 'text-orange-600' : 'text-gray-500'
                )}>
                  {item.label}
                </span>
              </div>
            ) : (
              <div className={cn(
                'flex flex-col items-center justify-center w-full h-full rounded-2xl transition-colors',
                isActive(item.path)
                  ? item.path === '/actions' ? 'text-sky-500' : 'text-orange-500'
                  : 'text-gray-400 hover:text-gray-600 active:bg-gray-50'
              )}>
                <div className={cn(
                  'transition-transform duration-200',
                  isActive(item.path) && 'scale-110'
                )}>
                  {item.icon}
                </div>
                <span className="mt-1 text-xs font-medium">{item.label}</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
