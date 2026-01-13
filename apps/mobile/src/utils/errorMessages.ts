import { ApiError } from '../services/api';

/**
 * Child-friendly error message mapper
 *
 * Converts technical API errors into age-appropriate messages
 * that children and parents can understand
 */

interface FriendlyError {
  title: string;
  message: string;
  emoji: string;
}

/**
 * Map API error to child-friendly message
 */
export function mapToFriendlyError(error: ApiError): FriendlyError {
  // Network errors
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return {
      title: 'Taking Too Long',
      message: "This is taking longer than usual. Let's try again!",
      emoji: '⏰',
    };
  }

  if (error.code === 'ERR_NETWORK' || !error.statusCode) {
    return {
      title: 'No Internet',
      message:
        "Oops! We can't connect to the internet. Please check your connection.",
      emoji: '📡',
    };
  }

  // HTTP status codes
  switch (error.statusCode) {
    case 400:
      return {
        title: 'Oops!',
        message: "Something wasn't quite right. Let's try that again!",
        emoji: '🤔',
      };

    case 401:
    case 403:
      return {
        title: 'Need to Sign In',
        message: "You need to sign in to do that. Let's go to the login page!",
        emoji: '🔐',
      };

    case 404:
      return {
        title: "Can't Find That",
        message:
          "We couldn't find what you're looking for. It might have been deleted.",
        emoji: '🔍',
      };

    case 429:
      return {
        title: 'Slow Down',
        message: "You're going too fast! Let's wait a moment and try again.",
        emoji: '🐌',
      };

    case 500:
    case 502:
    case 503:
      return {
        title: 'Something Broke',
        message:
          "Uh oh! Something went wrong on our end. Let's try again in a bit.",
        emoji: '🔧',
      };

    default:
      break;
  }

  // Story-specific errors (based on message content)
  const message = error.message.toLowerCase();

  if (message.includes('story') && message.includes('limit')) {
    return {
      title: 'Library Full',
      message:
        'Your library is full! You can save up to 50 stories. Try deleting some old ones first.',
      emoji: '📚',
    };
  }

  if (message.includes('inappropriate') || message.includes('content')) {
    return {
      title: "Let's Try Different Words",
      message:
        "Those words aren't quite right. Let's pick something different!",
      emoji: '✏️',
    };
  }

  if (message.includes('generation') || message.includes('create')) {
    return {
      title: 'Story Creation Failed',
      message: "We couldn't create your story right now. Want to try again?",
      emoji: '📖',
    };
  }

  if (message.includes('audio') || message.includes('narration')) {
    return {
      title: 'Audio Problem',
      message: "We couldn't load the story audio. Let's try again!",
      emoji: '🔊',
    };
  }

  if (message.includes('pin') || message.includes('parental')) {
    return {
      title: 'Wrong PIN',
      message: "That PIN isn't right. Ask your parent to help!",
      emoji: '🔢',
    };
  }

  // Default friendly error
  return {
    title: 'Oops!',
    message: "Something didn't work. Let's try that again!",
    emoji: '😊',
  };
}

/**
 * Get a short error message for inline display (e.g., form errors)
 */
export function getShortErrorMessage(error: ApiError): string {
  const friendly = mapToFriendlyError(error);
  return friendly.message;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: ApiError): boolean {
  // Network errors are retryable
  if (!error.statusCode || error.code === 'ERR_NETWORK') {
    return true;
  }

  // Timeout errors are retryable
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return true;
  }

  // 5xx server errors are retryable
  if (error.statusCode >= 500) {
    return true;
  }

  // 429 rate limit is retryable after delay
  if (error.statusCode === 429) {
    return true;
  }

  // Client errors (4xx) are generally not retryable
  return false;
}
