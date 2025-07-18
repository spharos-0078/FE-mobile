'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import LoginForm from '@/components/molecules/LoginForm';
import { useAlert } from '@/hooks/useAlert';
import Header from '@/components/layout/Header';

interface LoginSectionProps {
  searchParams: { callbackUrl?: string };
}

export default function LoginSection({ searchParams }: LoginSectionProps) {
  const [error, setError] = useState('');
  const router = useRouter();
  const { success, error: showError, hideAll } = useAlert();

  // 페이지 로드 시 Alert 초기화 (한 번만 실행)
  useEffect(() => {
    hideAll();
  }, []); // 빈 의존성 배열로 한 번만 실행

  const handleLogin = async (email: string, password: string) => {
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        const errorMessage =
          res.error === 'CredentialsSignin'
            ? '아이디 또는 비밀번호가 일치하지 않습니다.'
            : res.error;
        setError(errorMessage);
        showError(errorMessage);
        return;
      }

      if (res?.ok) {
        // 로그인 성공 시 환영 메시지 표시
        const welcomeMessage = `${email.split('@')[0]}님, 어서오세요!`;
        success(welcomeMessage);

        // 잠시 후 리다이렉트 (사용자가 메시지를 볼 수 있도록)
        setTimeout(async () => {
          const callbackUrl = searchParams?.callbackUrl;
          await signIn('credentials', {
            email,
            password,
            redirect: true,
            callbackUrl: callbackUrl || '/',
          });
        }, 1500); // 1.5초 후 리다이렉트
      }
    } catch {
      const errorMessage = '로그인 중 오류가 발생했습니다.';
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  return (
    <>
      <Header title="로그인" isCloseButton={true} />
      <LoginForm
        onSubmit={handleLogin}
        error={error}
        onClearError={() => setError('')}
      />

      {/* SIGNUP Button */}
      <div className="absolute bottom-4 left-0 right-0 py-6 px-4">
        <Button
          onClick={() => router.push('/signup')}
          className="w-full bg-background text-custom-green font-bold text-md py-4 rounded-sm h-14"
        >
          회원가입
        </Button>
      </div>
    </>
  );
}
