import { z } from 'zod';

/**
 * User registration request schema
 */
export const RegisterRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name must contain only letters and spaces'),
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

/**
 * User login request schema
 */
export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

/**
 * Refresh token request schema
 */
export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;

/**
 * Auth response schema (includes tokens and user info)
 */
export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().int().positive(),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string(),
  }),
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

/**
 * Token payload schema (JWT claims)
 */
export const TokenPayloadSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  iat: z.number().int().positive(),
  exp: z.number().int().positive(),
});
export type TokenPayload = z.infer<typeof TokenPayloadSchema>;
