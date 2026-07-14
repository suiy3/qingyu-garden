import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Delete, HelpCircle } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Button from '@/components/common/Button';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

export default function ParentAuth() {
  const navigate = useNavigate();
  const { user, setParentPassword, validateParentPassword } = useAppStore();
  const hasPassword = !!user.parentPassword;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgetHint, setShowForgetHint] = useState(false);

  const isSettingPassword = useRef(false);

  useEffect(() => {
    if (isSettingPassword.current) return;

    if (hasPassword && password.length === 6) {
      const isValid = validateParentPassword(password);
      if (isValid) {
        navigate('/parent/dashboard');
      } else {
        setError('密码错误，请重试');
        setTimeout(() => {
          setPassword('');
          setError('');
        }, 1000);
      }
    }
  }, [password, hasPassword, validateParentPassword, navigate]);

  const handleNumberClick = (num: string) => {
    setError('');
    if (hasPassword) {
      if (password.length < 6) setPassword(password + num);
    } else {
      if (confirmPassword.length > 0) {
        if (confirmPassword.length < 6) setConfirmPassword(confirmPassword + num);
      } else {
        if (password.length < 6) setPassword(password + num);
      }
    }
  };

  const handleDelete = () => {
    setError('');
    if (hasPassword) {
      setPassword(password.slice(0, -1));
    } else {
      if (confirmPassword.length > 0) {
        setConfirmPassword(confirmPassword.slice(0, -1));
      } else {
        setPassword(password.slice(0, -1));
      }
    }
  };

  const handleSetPassword = () => {
    if (password.length !== 6) { setError('请输入6位数字密码'); return; }
    if (confirmPassword.length !== 6) { setError('请再次输入密码进行确认'); return; }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      setPassword('');
      setConfirmPassword('');
      return;
    }
    if (!/^\d{6}$/.test(password)) { setError('密码必须是6位数字'); return; }

    isSettingPassword.current = true;
    setParentPassword(password);
    navigate('/parent/dashboard', { replace: true });
  };

  const renderDots = (value: string, length = 6) => (
    <div className="flex gap-4 justify-center">
      {Array.from({ length }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'w-3 h-3 rounded-full border-2 transition-all duration-200',
            i < value.length ? 'bg-slate-700 border-slate-700' : 'border-gray-300'
          )}
        />
      ))}
    </div>
  );

  const numPad = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'delete'],
  ];

  return (
    <PageContainer title="家长守护" showBack>
      <div className="px-6 py-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            {hasPassword ? '输入守护密码' : '设置守护密码'}
          </h2>
          <p className="text-sm text-gray-500">
            {hasPassword ? '验证身份后进入家长守护模式' : '请设置6位数字密码，用于身份验证'}
          </p>
        </div>

        {!hasPassword ? (
          <div className="mb-8">
            <p className="text-sm text-gray-600 mb-4 text-center">
              {confirmPassword.length > 0 ? '请再次输入密码确认' : '请输入6位数字密码'}
            </p>
            {renderDots(confirmPassword.length > 0 ? confirmPassword : password)}

            {error && (
              <p className="text-red-500 text-sm text-center mt-4">{error}</p>
            )}

            <div className="mt-6 space-y-3">
              {password.length === 6 && confirmPassword.length === 0 && (
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full"
                  onClick={() => { setPassword(''); setError(''); }}
                >
                  重新输入
                </Button>
              )}

              {confirmPassword.length === 6 && (
                <Button
                  size="md"
                  className="w-full bg-slate-800 text-white hover:bg-slate-900"
                  onClick={handleSetPassword}
                >
                  设置密码
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-8">
            {renderDots(password)}
            {error && (
              <p className="text-red-500 text-sm text-center mt-4">{error}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto mb-6">
          {numPad.flat().map((key, index) => {
            if (key === '') return <div key={index} className="aspect-square" />;
            if (key === 'delete') {
              return (
                <button
                  key={index}
                  onClick={handleDelete}
                  className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 active:bg-gray-200 transition-colors"
                >
                  <Delete size={22} />
                </button>
              );
            }
            return (
              <button
                key={index}
                onClick={() => handleNumberClick(key)}
                className="aspect-square rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-2xl font-medium text-gray-800 active:bg-gray-100 active:scale-95 transition-all"
              >
                {key}
              </button>
            );
          })}
        </div>

        {hasPassword && (
          <div className="text-center">
            <button
              onClick={() => setShowForgetHint(!showForgetHint)}
              className="text-sm text-gray-400 flex items-center gap-1 mx-auto hover:text-gray-600 transition-colors"
            >
              <HelpCircle size={14} />
              忘记密码？
            </button>
            {showForgetHint && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 leading-relaxed">
                  为保护隐私安全，密码无法找回。
                  <br />
                  如需重置，请清空应用数据后重新设置。
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
