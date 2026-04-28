import { z } from 'zod';

// Sifre kurali onboarding dokumanindaki minimum gereksinimlere gore yazildi.
const passwordRule = z
  .string()
  .min(8, 'Password must be at least 8 characters long.')
  .regex(/[A-Z]/, 'Password must include at least one uppercase letter.')
  .regex(/[0-9]/, 'Password must include at least one number.');

export const registerBodySchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: passwordRule,
  name: z.string().min(2).max(80),
  apartmentNo: z.string().max(30).optional(),
  phone: z.string().max(30).optional(),
});

export const loginBodySchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1),
});

export const refreshBodySchema = z.object({
  refreshToken: z.string().min(10),
});

export const logoutBodySchema = refreshBodySchema;
