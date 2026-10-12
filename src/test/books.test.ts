import { describe, expect, it } from 'vitest';
import manuscripts from '@/lib/manuscripts.json';

describe('Requested book collection', () => {
  it('contains thirty distinct books', () => {
    expect(manuscripts).toHaveLength(30);
    expect(new Set(manuscripts.map(book => book.id)).size).toBe(30);
    expect(new Set(manuscripts.map(book => book.title)).size).toBe(30);
  });
  it('contains five ghost novels', () => {
    expect(manuscripts.filter(book => book.genre === 'ভূত')).toHaveLength(5);
  });
  it('contains five romantic novels', () => {
    expect(manuscripts.filter(book => book.genre === 'প্রেম')).toHaveLength(5);
  });
  it('provides substantive chapter-based openings rather than complete short tales', () => {
    for (const book of manuscripts) {
      expect(book.outline.length).toBeGreaterThan(book.chapters.length);
      const opening = book.chapters[0];
      expect(opening).toBeDefined();
      if (!opening) throw new Error(`Missing chapter for ${book.title}`);
      expect(opening.paragraphs.join(' ').split(/\s+/).length).toBeGreaterThanOrEqual(300);
    }
  });
});