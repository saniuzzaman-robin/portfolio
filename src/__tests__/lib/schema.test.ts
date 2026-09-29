import { describe, it, expect } from 'vitest';
import { generateBreadcrumbSchema, generateCollectionSchema } from '@/lib/schema';

describe('generateBreadcrumbSchema', () => {
  it('returns correct @context and @type', () => {
    const result = generateBreadcrumbSchema([{ name: 'Home', url: 'https://example.com' }]);
    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('BreadcrumbList');
  });

  it('maps items to ListItem entries with 1-based positions', () => {
    const result = generateBreadcrumbSchema([
      { name: 'Home', url: 'https://example.com' },
      { name: 'About', url: 'https://example.com/about' },
    ]);
    expect(result.itemListElement).toHaveLength(2);
    expect(result.itemListElement[0]).toMatchObject({
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://example.com',
    });
    expect(result.itemListElement[1].position).toBe(2);
  });

  it('returns empty itemListElement for empty input', () => {
    const result = generateBreadcrumbSchema([]);
    expect(result.itemListElement).toHaveLength(0);
  });
});

describe('generateCollectionSchema', () => {
  const opts = {
    name: 'Projects',
    description: 'My open-source projects',
    url: 'https://example.com/projects',
    items: [
      { name: 'Proj A', description: 'Desc A', url: 'https://example.com/a' },
      { name: 'Proj B', description: 'Desc B', url: 'https://example.com/b' },
    ],
  };

  it('returns CollectionPage type', () => {
    expect(generateCollectionSchema(opts)['@type']).toBe('CollectionPage');
  });

  it('lists items as a 1-based ItemList', () => {
    const result = generateCollectionSchema(opts);
    const list = result.mainEntity.itemListElement;
    expect(list).toHaveLength(2);
    expect(list[0].position).toBe(1);
    expect(list[0].item.name).toBe('Proj A');
    expect(list[1].position).toBe(2);
  });
});
