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

const registerSchema = z.object({
  email: z.string().email('Gecerli bir e-posta gir.'),
  password: z
    .string()
    .min(8, 'Sifre en az 8 karakter olmali.')
    .regex(/[A-Z]/, 'En az bir buyuk harf olmali.')
    .regex(/[0-9]/, 'En az bir rakam olmali.'),
  name: z.string().min(2, 'Ad en az 2 karakter olmali.').max(80),
  apartmentNo: z.string().max(30).optional(),
  phone: z.string().max(30).optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

/**
 * Register sayfasi:
 * - Yeni kullanici acilir.
 * - Basari durumunda otomatik login benzeri session yazilir.
 */
export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      apartmentNo: '',
      phone: '',
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      saveAuthSession(data.tokens, data.user);
      router.push('/dashboard');
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    const payload = {
      ...values,
      apartmentNo: values.apartmentNo?.trim() || undefined,
      phone: values.phone?.trim() || undefined,
    };
    registerMutation.mutate(payload);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <section className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Sitepp Kayit</h1>
        <p className="mt-1 text-sm text-slate-600">Yeni sakin hesabi olustur.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <label className="block">
            <span className="mb-1 block text-sm text-slate-700">Ad Soyad</span>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring-2"
              placeholder="Ornek Kullanici"
              {...register('name')}
            />
            {errors.name ? <span className="mt-1 block text-xs text-red-600">{errors.name.message}</span> : null}
          </label>

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
              placeholder="Test1234"
              {...register('password')}
            />
            {errors.password ? (
              <span className="mt-1 block text-xs text-red-600">{errors.password.message}</span>
            ) : null}
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm text-slate-700">Daire No (opsiyonel)</span>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring-2"
                placeholder="A-12"
                {...register('apartmentNo')}
              />
              {errors.apartmentNo ? (
                <span className="mt-1 block text-xs text-red-600">{errors.apartmentNo.message}</span>
              ) : null}
            </label>

            <label className="block">
              <span className="mb-1 block text-sm text-slate-700">Telefon (opsiyonel)</span>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring-2"
                placeholder="05xx xxx xx xx"
                {...register('phone')}
              />
              {errors.phone ? <span className="mt-1 block text-xs text-red-600">{errors.phone.message}</span> : null}
            </label>
          </div>

          {registerMutation.isError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {getApiErrorMessage(registerMutation.error)}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-70"
          >
            {registerMutation.isPending ? 'Kayit yapiliyor...' : 'Kayit Ol'}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Hesabin var mi?{' '}
          <Link className="font-semibold text-brand-700 hover:underline" href="/login">
            Giris yap
          </Link>
        </p>
      </section>
    </main>
  );
}
