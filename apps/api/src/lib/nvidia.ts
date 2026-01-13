import OpenAI from 'openai';
import { config } from '../config/env';
import { logger } from './logger';

/**
 * NVIDIA AI client for story generation
 * Uses OpenAI SDK with NVIDIA's API endpoint
 */
export class NvidiaClient {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: config.NVIDIA_API_KEY,
      baseURL: config.NVIDIA_API_BASE_URL,
    });

    logger.info('NVIDIA AI client initialized');
  }

  /**
   * Generate story content using NVIDIA AI
   * @param prompt - The story generation prompt
   * @param options - Generation options
   * @returns Generated story text
   */
  async generateStory(
    prompt: string,
    options: {
      maxTokens?: number;
      temperature?: number;
      model?: string;
    } = {}
  ): Promise<string> {
    const {
      maxTokens = 2000,
      temperature = 0.7,
      model = 'meta/llama-3.1-405b-instruct',
    } = options;

    try {
      logger.debug({ prompt, options }, 'Generating story with NVIDIA AI');

      const completion = await this.client.chat.completions.create({
        model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: maxTokens,
        temperature,
        stream: false,
      });

      const content = completion.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content returned from NVIDIA AI');
      }

      logger.info(
        { tokens: completion.usage?.total_tokens },
        'Story generated successfully'
      );

      return content.trim();
    } catch (error) {
      logger.error(
        { error, prompt: prompt.substring(0, 100) },
        'Story generation failed'
      );
      throw new Error(
        `NVIDIA AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate structured story with segments (for interactive stories)
   * @param prompt - The story generation prompt
   * @param options - Generation options
   * @returns Generated story structure
   */
  async generateInteractiveStory(
    prompt: string,
    options: {
      maxTokens?: number;
      temperature?: number;
      model?: string;
    } = {}
  ): Promise<{
    segments: Array<{
      id: string;
      content: string;
      choices?: Array<{ text: string; nextSegmentId?: string }>;
      isEnding?: boolean;
    }>;
  }> {
    const {
      maxTokens = 3000,
      temperature = 0.7,
      model = 'meta/llama-3.1-405b-instruct',
    } = options;

    try {
      logger.debug(
        { prompt, options },
        'Generating interactive story with NVIDIA AI'
      );

      const completion = await this.client.chat.completions.create({
        model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: maxTokens,
        temperature,
        stream: false,
      });

      const content = completion.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content returned from NVIDIA AI');
      }

      // Parse the structured JSON response
      const parsedContent = this.parseInteractiveStoryResponse(content);

      logger.info(
        {
          tokens: completion.usage?.total_tokens,
          segmentCount: parsedContent.segments.length,
        },
        'Interactive story generated successfully'
      );

      return parsedContent;
    } catch (error) {
      logger.error(
        { error, prompt: prompt.substring(0, 100) },
        'Interactive story generation failed'
      );
      throw new Error(
        `NVIDIA AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Parse interactive story response from AI
   * @param content - Raw AI response
   * @returns Structured story segments
   */
  private parseInteractiveStoryResponse(content: string): {
    segments: Array<{
      id: string;
      content: string;
      choices?: Array<{ text: string; nextSegmentId?: string }>;
      isEnding?: boolean;
    }>;
  } {
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      const jsonContent = jsonMatch ? jsonMatch[1] : content;

      const parsed = JSON.parse(jsonContent.trim());

      if (!parsed.segments || !Array.isArray(parsed.segments)) {
        throw new Error('Invalid story structure: missing segments array');
      }

      return parsed;
    } catch (error) {
      logger.error(
        { error, content: content.substring(0, 200) },
        'Failed to parse interactive story response'
      );
      throw new Error('Failed to parse AI response as structured story');
    }
  }

  /**
   * Check if the client is healthy
   * @returns True if the client can connect to NVIDIA API
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch (error) {
      logger.error({ error }, 'NVIDIA AI health check failed');
      return false;
    }
  }
}

/**
 * Singleton instance of NVIDIA client
 */
export const nvidiaClient = new NvidiaClient();
