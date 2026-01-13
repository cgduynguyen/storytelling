import { Request, Response, NextFunction } from 'express';

/**
 * Input sanitization middleware
 *
 * Sanitizes user inputs to prevent:
 * - XSS attacks
 * - SQL injection (though Prisma handles this)
 * - Inappropriate content in character names and story inputs
 * - Excessively long inputs
 */

/**
 * Sanitize a string by removing potentially dangerous characters
 */
function sanitizeString(input: string, maxLength = 1000): string {
  // Trim whitespace
  let sanitized = input.trim();

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Remove script tags specifically (double-check)
  sanitized = sanitized.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ''
  );

  // Remove potentially dangerous characters but keep letters, numbers, spaces, and basic punctuation
  sanitized = sanitized.replace(/[^\w\s\-.,!?']/g, '');

  return sanitized;
}

/**
 * Sanitize character names (more restrictive)
 */
function sanitizeCharacterName(name: string): string {
  let sanitized = name.trim();

  // Limit to 50 characters for names
  if (sanitized.length > 50) {
    sanitized = sanitized.substring(0, 50);
  }

  // Only allow letters, spaces, hyphens, and apostrophes for names
  sanitized = sanitized.replace(/[^a-zA-Z\s\-']/g, '');

  // Remove multiple spaces
  sanitized = sanitized.replace(/\s+/g, ' ');

  return sanitized;
}

/**
 * Check for inappropriate words (basic profanity filter)
 */
const inappropriateWords = [
  // Add common inappropriate words here
  // This is a basic list - consider using a library like 'bad-words' for production
  'badword1',
  'badword2',
  // ... more words
];

function containsInappropriateContent(text: string): boolean {
  const lowerText = text.toLowerCase();
  return inappropriateWords.some((word) => lowerText.includes(word));
}

/**
 * Sanitize request body fields
 */
export function sanitizeInput(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    if (req.body) {
      // Sanitize character names
      if (req.body.characterName) {
        req.body.characterName = sanitizeCharacterName(req.body.characterName);

        if (req.body.characterName.length === 0) {
          res.status(400).json({
            error: 'Invalid character name',
            message: 'Character name contains invalid characters',
          });
          return;
        }

        if (containsInappropriateContent(req.body.characterName)) {
          res.status(400).json({
            error: 'Inappropriate content',
            message: 'Character name contains inappropriate content',
          });
          return;
        }
      }

      // Sanitize story titles
      if (req.body.title) {
        req.body.title = sanitizeString(req.body.title, 200);
      }

      // Sanitize custom prompts (if any)
      if (req.body.customPrompt) {
        req.body.customPrompt = sanitizeString(req.body.customPrompt, 500);

        if (containsInappropriateContent(req.body.customPrompt)) {
          res.status(400).json({
            error: 'Inappropriate content',
            message: 'Custom prompt contains inappropriate content',
          });
          return;
        }
      }

      // Sanitize child name in user profile
      if (req.body.childName) {
        req.body.childName = sanitizeCharacterName(req.body.childName);

        if (containsInappropriateContent(req.body.childName)) {
          res.status(400).json({
            error: 'Inappropriate content',
            message: 'Child name contains inappropriate content',
          });
          return;
        }
      }

      // Sanitize email (basic validation)
      if (req.body.email) {
        req.body.email = req.body.email.trim().toLowerCase();

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(req.body.email)) {
          res.status(400).json({
            error: 'Invalid email',
            message: 'Email address is not valid',
          });
          return;
        }
      }
    }

    next();
  } catch (error) {
    console.error('Sanitization error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process request',
    });
  }
}

/**
 * Validate parental PIN format
 */
export function validateParentalPin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.body.pin) {
    const pin = req.body.pin.toString();

    // PIN must be exactly 4 digits
    if (!/^\d{4}$/.test(pin)) {
      res.status(400).json({
        error: 'Invalid PIN',
        message: 'PIN must be exactly 4 digits',
      });
      return;
    }

    // Store as string
    req.body.pin = pin;
  }

  next();
}
