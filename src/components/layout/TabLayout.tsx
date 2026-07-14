import BottomNav from './BottomNav';

interface TabLayoutProps {
  children: React.ReactNode;
}

export default function TabLayout({ children }: TabLayoutProps) {
  return (
    <div className="relative min-h-screen">
      {children}
      <BottomNav />
    </div>
  );
}
