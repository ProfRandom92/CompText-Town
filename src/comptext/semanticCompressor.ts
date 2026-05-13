export interface CompressionResult {
  rawText: string;
  compressedText: string;
  rawTokens: number;
  compressedTokens: number;
  tokenReduction: number;
  retentionScore: number;
  driftScore: number;
  tags: string[];
}

const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'to', 'of', 'in', 'on', 'with', 'for', 'is', 'are', 'was', 'were', 'you', 'i']);

export class SemanticCompressor {
  compress(rawText: string): CompressionResult {
    const words = rawText.toLowerCase().match(/[a-z0-9']+/g) ?? [];
    const semanticWords = words.filter((word) => !stopWords.has(word));
    const tags = Array.from(new Set(semanticWords.filter((word) => word.length > 3))).slice(0, 8);
    const compressedText = tags.length > 0 ? `memory:${tags.join('|')}` : 'memory:quiet-rain';
    const rawTokens = Math.max(1, Math.ceil(words.length * 1.25));
    const compressedTokens = Math.max(1, Math.ceil(compressedText.length / 5));
    const tokenReduction = Math.max(0, Math.round((1 - compressedTokens / rawTokens) * 100));
    const retentionScore = Math.min(99, Math.max(70, 72 + tags.length * 3));
    const driftScore = Math.max(1, 100 - retentionScore);

    return {
      rawText,
      compressedText,
      rawTokens,
      compressedTokens,
      tokenReduction,
      retentionScore,
      driftScore,
      tags,
    };
  }
}
