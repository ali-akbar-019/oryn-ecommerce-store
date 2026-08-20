import { z } from 'zod';
export const registerSchema = z.object({ firstName: z.string().trim().min(1).max(80), lastName: z.string().trim().min(1).max(80), email: z.email(), password: z.string().min(8).max(128) });
export const loginSchema = z.object({ email: z.email(), password: z.string().min(1).max(128) });
export const refreshSchema = z.object({ refreshToken: z.string().min(20) });
