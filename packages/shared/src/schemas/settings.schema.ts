import { z } from 'zod';
import { AgeBandSchema, StoryThemeSchema } from './enums';

/**
 * Profile settings update request schema
 */
export const UpdateProfileRequestSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name must contain only letters and spaces')
    .optional(),
  email: z.string().email('Invalid email format').optional(),
});
export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;

/**
 * Profile response schema
 */
export const ProfileResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  createdAt: z.string().datetime(),
});
export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;

/**
 * Parental settings update request schema
 */
export const UpdateParentalSettingsRequestSchema = z.object({
  ageBand: AgeBandSchema.optional(),
  excludedThemes: z.array(StoryThemeSchema).optional(),
});
export type UpdateParentalSettingsRequest = z.infer<
  typeof UpdateParentalSettingsRequestSchema
>;

/**
 * Parental settings response schema
 */
export const ParentalSettingsResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  ageBand: AgeBandSchema,
  excludedThemes: z.array(StoryThemeSchema),
  updatedAt: z.string().datetime(),
});
export type ParentalSettingsResponse = z.infer<
  typeof ParentalSettingsResponseSchema
>;

/**
 * Parental PIN update request schema
 */
export const UpdatePinRequestSchema = z.object({
  currentPin: z.string().regex(/^\d{4}$/, 'PIN must be exactly 4 digits'),
  newPin: z.string().regex(/^\d{4}$/, 'PIN must be exactly 4 digits'),
});
export type UpdatePinRequest = z.infer<typeof UpdatePinRequestSchema>;

/**
 * Parental PIN verification request schema
 */
export const VerifyPinRequestSchema = z.object({
  pin: z.string().regex(/^\d{4}$/, 'PIN must be exactly 4 digits'),
});
export type VerifyPinRequest = z.infer<typeof VerifyPinRequestSchema>;

/**
 * PIN verification response schema
 */
export const PinVerificationResponseSchema = z.object({
  verified: z.boolean(),
});
export type PinVerificationResponse = z.infer<
  typeof PinVerificationResponseSchema
>;
