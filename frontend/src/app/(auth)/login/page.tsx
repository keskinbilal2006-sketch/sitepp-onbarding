'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { authApi } from '../../../features/auth/api/auth.api';
import { saveAuthSession } from '../../../lib/auth-session';
import { getApiErrorMessage } from '../../../lib/api-client';

const loginSchema = z.object({
  email: z.string().email('Gecerli bir e-posta gir.'),
  password: z.string().min(1, 'Sifre zorunlu.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Login sayfasi:
 * - Form validation Zod ile yapilir.
 * - Basarili olursa token saklanir ve dashboard'a gidilir.
 */
export default function LoginPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      saveAuthSession(data.tokens, data.user);
      router.push('/dashboard');
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <section className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Sitepp Giris</h1>
        <p className="mt-1 text-sm text-slate-600">E-posta ve sifre ile devam et.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <label className="block">
            <span className="mb-1 block text-sm text-slate-700">E-posta</span>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring-2"
              placeholder="ornek@sitepp.com"
              {...register('email')}
            />
            {errors.email ? <span className="mt-1 block text-xs text-red-600">{errors.email.message}</span> : null}
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-slate-700">Sifre</span>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring-2"
              placeholder="********"
              {...register('password')}
            />
            {errors.password ? (
              <span className="mt-1 block text-xs text-red-600">{errors.password.message}</span>
            ) : null}
          </label>

          {loginMutation.isError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {getApiErrorMessage(loginMutation.error)}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-70"
          >
            {loginMutation.isPending ? 'Giris yapiliyor...' : 'Giris Yap'}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Hesabin yok mu?{' '}
          <Link className="font-semibold text-brand-700 hover:underline" href="/register">
            Kayit ol
          </Link>
        </p>
      </section>
    </main>
  );
}
