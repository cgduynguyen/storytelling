import type { AgeBand, StoryTheme, StoryLength } from '@storyteller/shared';

/**
 * Word count targets for different story lengths
 */
export const WORD_COUNT_TARGETS = {
  SHORT: 300,
  MEDIUM: 600,
  LONG: 1000,
} as const;

/**
 * Age band content guidelines
 */
const AGE_BAND_GUIDELINES = {
  AGE_3_5: {
    vocabulary: 'simple words (200-500 word vocabulary)',
    sentences: 'short sentences (5-8 words)',
    themes: 'familiar everyday situations',
    complexity: 'repetitive patterns, predictable outcomes',
    avoid: 'complex plots, scary elements, any violence',
  },
  AGE_6_8: {
    vocabulary: 'elementary level (1000-2000 word vocabulary)',
    sentences: 'medium sentences (8-12 words)',
    themes: 'simple adventures, problem-solving',
    complexity: 'basic story arc with clear beginning/middle/end',
    avoid: 'complex emotions, scary scenarios, violence, death',
  },
  AGE_9_10: {
    vocabulary: 'intermediate level (2500+ word vocabulary)',
    sentences: 'varied sentence length (10-15 words)',
    themes: 'adventures, mysteries, friendships',
    complexity: 'multiple plot points, character development',
    avoid: 'violence, death, scary horror elements, mature themes',
  },
} as const;

/**
 * Content safety guardrails applied to all stories
 */
const SAFETY_GUARDRAILS = `
CRITICAL SAFETY REQUIREMENTS (MUST FOLLOW):
1. NO violence, fighting, weapons, or harm to any character
2. NO scary/horror elements (monsters, darkness, being lost/alone)
3. NO death or loss of any character (including pets)
4. NO sad or upsetting themes
5. NO bathroom humor or inappropriate content
6. ALL characters show kindness, respect, and positive behavior
7. ALL conflicts resolved peacefully through communication
8. ALL endings are happy and reassuring
9. ALWAYS promote values: kindness, friendship, curiosity, courage, helping others
10. ALWAYS use inclusive, diverse characters without stereotypes
`;

/**
 * Generate a story creation prompt based on preferences
 */
export function buildStoryPrompt(params: {
  ageBand: AgeBand;
  theme: StoryTheme;
  length: StoryLength;
  mainCharacter?: string;
  excludedThemes?: string[];
}): string {
  const { ageBand, theme, length, mainCharacter, excludedThemes = [] } = params;

  const guidelines = AGE_BAND_GUIDELINES[ageBand];
  const wordTarget = WORD_COUNT_TARGETS[length];

  const characterInstruction = mainCharacter
    ? `The main character MUST be named "${mainCharacter}".`
    : 'Create a relatable main character with a fitting name.';

  const exclusionNote =
    excludedThemes.length > 0
      ? `\nDO NOT include these themes: ${excludedThemes.join(', ')}`
      : '';

  return `You are a professional children's storyteller. Write an engaging, age-appropriate story.

TARGET AUDIENCE: ${ageBand.replace('_', ' ')} (${guidelines.vocabulary})
THEME: ${theme}
LENGTH: Approximately ${wordTarget} words

${SAFETY_GUARDRAILS}

STYLE REQUIREMENTS:
- Vocabulary: ${guidelines.vocabulary}
- Sentences: ${guidelines.sentences}
- Themes: ${guidelines.themes}
- Complexity: ${guidelines.complexity}
- AVOID: ${guidelines.avoid}${exclusionNote}

CHARACTER:
${characterInstruction}

STRUCTURE:
1. Opening: Introduce character and setting (10% of story)
2. Adventure: Main activity or problem (70% of story)
3. Resolution: Happy ending with lesson learned (20% of story)

OUTPUT FORMAT:
Return ONLY the story text with a title.
Format:
Title: [Engaging Title]

[Story content with clear paragraphs]

Begin writing the story now:`;
}

/**
 * Generate an interactive story creation prompt
 */
export function buildInteractiveStoryPrompt(params: {
  ageBand: AgeBand;
  theme: StoryTheme;
  length: StoryLength;
  mainCharacter?: string;
  excludedThemes?: string[];
}): string {
  const { ageBand, theme, length, mainCharacter, excludedThemes = [] } = params;

  const guidelines = AGE_BAND_GUIDELINES[ageBand];
  const wordTarget = WORD_COUNT_TARGETS[length];
  const segmentCount = length === 'SHORT' ? 3 : length === 'MEDIUM' ? 5 : 7;

  const characterInstruction = mainCharacter
    ? `The main character MUST be named "${mainCharacter}".`
    : 'Create a relatable main character with a fitting name.';

  const exclusionNote =
    excludedThemes.length > 0
      ? `\nDO NOT include these themes: ${excludedThemes.join(', ')}`
      : '';

  return `You are a professional children's storyteller. Create an interactive choose-your-own-adventure story.

TARGET AUDIENCE: ${ageBand.replace('_', ' ')} (${guidelines.vocabulary})
THEME: ${theme}
LENGTH: Approximately ${wordTarget} words total across all segments

${SAFETY_GUARDRAILS}

STYLE REQUIREMENTS:
- Vocabulary: ${guidelines.vocabulary}
- Sentences: ${guidelines.sentences}
- Themes: ${guidelines.themes}
- Complexity: ${guidelines.complexity}
- AVOID: ${guidelines.avoid}${exclusionNote}

CHARACTER:
${characterInstruction}

INTERACTIVE STRUCTURE:
- Total segments: ${segmentCount} (including endings)
- Choice points: Minimum 3 decision points
- Endings: At least 2 different happy endings
- Each choice must be meaningful and lead to different outcomes
- All paths must end happily

SEGMENT GUIDELINES:
- Each segment: 80-150 words
- Present 2-3 choices at decision points
- Choices should be clear and age-appropriate
- Use descriptive choice text that hints at outcomes

OUTPUT FORMAT (CRITICAL - MUST BE VALID JSON):
Return a JSON object with this exact structure:

{
  "title": "Story Title",
  "segments": [
    {
      "id": "segment-1",
      "content": "Opening segment text introducing character and situation...",
      "choices": [
        {
          "text": "Choice 1 description",
          "nextSegmentId": "segment-2"
        },
        {
          "text": "Choice 2 description",
          "nextSegmentId": "segment-3"
        }
      ]
    },
    {
      "id": "segment-2",
      "content": "Continue story based on choice 1...",
      "choices": [...]
    },
    {
      "id": "ending-1",
      "content": "A happy ending...",
      "isEnding": true
    }
  ]
}

VALIDATION REQUIREMENTS:
1. All nextSegmentId references must point to valid segment IDs
2. Every non-ending segment must have 2-3 choices
3. Every choice path must lead to an ending
4. All endings must have isEnding: true and no choices
5. Segment IDs must be unique

Begin creating the interactive story now (return ONLY valid JSON):`;
}

/**
 * Validate story content for safety violations
 * Returns true if content is safe, false if it violates safety rules
 */
export function validateStoryContent(content: string): {
  isSafe: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  // Lowercase content for case-insensitive matching
  const lowerContent = content.toLowerCase();

  // Check for violence/harm keywords
  const violenceKeywords = [
    'kill',
    'death',
    'die',
    'dead',
    'blood',
    'hurt',
    'pain',
    'fight',
    'weapon',
    'gun',
    'knife',
    'sword',
    'hit',
    'punch',
    'kick',
    'attack',
  ];

  const foundViolence = violenceKeywords.filter((keyword) =>
    lowerContent.includes(keyword)
  );
  if (foundViolence.length > 0) {
    violations.push(`Violence/harm detected: ${foundViolence.join(', ')}`);
  }

  // Check for scary/horror keywords
  const scaryKeywords = [
    'monster',
    'ghost',
    'scary',
    'afraid',
    'terrified',
    'nightmare',
    'dark',
    'alone',
    'lost',
    'trapped',
    'scream',
    'cry',
    'tears',
  ];

  const foundScary = scaryKeywords.filter((keyword) =>
    lowerContent.includes(keyword)
  );
  if (foundScary.length > 0) {
    violations.push(`Scary/upsetting content: ${foundScary.join(', ')}`);
  }

  // Check for inappropriate content
  const inappropriateKeywords = [
    'poop',
    'pee',
    'butt',
    'fart',
    'stupid',
    'hate',
    'ugly',
    'dumb',
  ];

  const foundInappropriate = inappropriateKeywords.filter((keyword) =>
    lowerContent.includes(keyword)
  );
  if (foundInappropriate.length > 0) {
    violations.push(`Inappropriate language: ${foundInappropriate.join(', ')}`);
  }

  return {
    isSafe: violations.length === 0,
    violations,
  };
}

/**
 * Extract title from story content
 */
export function extractTitle(content: string): {
  title: string;
  storyText: string;
} {
  // Look for "Title: [title]" pattern
  const titleMatch = content.match(/^Title:\s*(.+?)$/im);

  if (titleMatch) {
    const title = titleMatch[1].trim();
    const storyText = content
      .substring(titleMatch.index! + titleMatch[0].length)
      .trim();
    return { title, storyText };
  }

  // Fallback: Use first line as title if it's short enough
  const lines = content.split('\n').filter((line) => line.trim());
  if (lines.length > 0 && lines[0].length <= 100) {
    return {
      title: lines[0].trim(),
      storyText: lines.slice(1).join('\n').trim(),
    };
  }

  // Last resort: Generate a generic title
  return {
    title: 'A Magical Adventure',
    storyText: content.trim(),
  };
}
