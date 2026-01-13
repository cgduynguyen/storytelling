import jwt from 'jsonwebtoken';
import { config } from '../config/env';

/**
 * JWT payload structure
 */
export interface JwtPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

/**
 * JWT token pair
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Sign a JWT access token
 *
 * @param payload - User data to include in token
 * @returns Signed JWT access token
 */
export const signAccessToken = (payload: Omit<JwtPayload, 'type'>): string => {
  return jwt.sign({ ...payload, type: 'access' }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
    issuer: 'storyteller-api',
    audience: 'storyteller-app',
  } as jwt.SignOptions);
};

/**
 * Sign a JWT refresh token
 *
 * @param payload - User data to include in token
 * @returns Signed JWT refresh token
 */
export const signRefreshToken = (payload: Omit<JwtPayload, 'type'>): string => {
  return jwt.sign({ ...payload, type: 'refresh' }, config.JWT_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN,
    issuer: 'storyteller-api',
    audience: 'storyteller-app',
  } as jwt.SignOptions);
};

/**
 * Generate access and refresh token pair
 *
 * @param payload - User data to include in tokens
 * @returns Token pair (access and refresh tokens)
 */
export const generateTokenPair = (
  payload: Omit<JwtPayload, 'type'>
): TokenPair => {
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
};

/**
 * Verify and decode a JWT token
 *
 * @param token - JWT token to verify
 * @param expectedType - Expected token type (access or refresh)
 * @returns Decoded payload if valid
 * @throws Error if token is invalid or expired
 */
export const verifyToken = (
  token: string,
  expectedType?: 'access' | 'refresh'
): JwtPayload => {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET, {
      issuer: 'storyteller-api',
      audience: 'storyteller-app',
    }) as JwtPayload;

    // Verify token type if specified
    if (expectedType && decoded.type !== expectedType) {
      throw new Error(
        `Invalid token type: expected ${expectedType}, got ${decoded.type}`
      );
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else {
      throw error;
    }
  }
};

/**
 * Decode JWT without verifying (for debugging)
 *
 * @param token - JWT token to decode
 * @returns Decoded payload (unverified)
 */
export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch {
    return null;
  }
};

/**
 * Refresh access token using refresh token
 *
 * @param refreshToken - Valid refresh token
 * @returns New token pair
 * @throws Error if refresh token is invalid
 */
export const refreshAccessToken = (refreshToken: string): TokenPair => {
  const payload = verifyToken(refreshToken, 'refresh');

  // Generate new token pair
  return generateTokenPair({
    userId: payload.userId,
    email: payload.email,
  });
};
