import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Button from '@/components/common/Button';
import { hasParentAccess } from '@/utils/parentAccess';

export default function ParentAccessGuard({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  if (hasParentAccess()) return <>{children}</>;

  return (
    <PageContainer title="家长守护" showBack className="px-5 pt-16">
      <div className="mx-auto max-w-sm text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700">
          <LockKeyhole size={34} />
        </div>
        <h1 className="mt-6 text-xl font-bold text-gray-800">家长视图已退出</h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">再次进入前，需要先确认本次查看范围。</p>
        <Button className="mt-6 w-full" onClick={() => navigate('/parent')}>查看访问说明</Button>
      </div>
    </PageContainer>
  );
}
