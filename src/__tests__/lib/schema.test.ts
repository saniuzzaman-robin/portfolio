import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateBreadcrumbSchema,
  generateProjectSchema,
  generateGameSchema,
  generateFAQSchema,
  generateCollectionSchema,
} from '@/lib/schema';

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

describe('generateProjectSchema', () => {
  it('returns CreativeWork with correct fields', () => {
    const result = generateProjectSchema({
      title: 'My Portfolio',
      description: 'A personal portfolio site',
      link: 'https://example.com',
    });
    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('CreativeWork');
    expect(result.name).toBe('My Portfolio');
    expect(result.description).toBe('A personal portfolio site');
    expect(result.url).toBe('https://example.com');
  });

  it('includes a Person creator', () => {
    const result = generateProjectSchema({
      title: 'T',
      description: 'D',
      link: 'https://example.com',
    });
    expect(result.creator['@type']).toBe('Person');
    expect(typeof result.creator.name).toBe('string');
  });
});

describe('generateGameSchema', () => {
  const input = {
    name: 'Snake',
    description: 'Classic snake game',
    url: 'https://example.com/games/snake',
    genre: 'Arcade',
  };

  it('returns SoftwareApplication type', () => {
    expect(generateGameSchema(input)['@type']).toBe('SoftwareApplication');
  });

  it('sets applicationCategory to Game', () => {
    expect(generateGameSchema(input).applicationCategory).toBe('Game');
  });

  it('sets applicationSubCategory to the provided genre', () => {
    expect(generateGameSchema(input).applicationSubCategory).toBe('Arcade');
  });

  it('sets operatingSystem to Web Browser', () => {
    expect(generateGameSchema(input).operatingSystem).toBe('Web Browser');
  });

  it('offers a free price', () => {
    const result = generateGameSchema(input);
    expect(result.offers['@type']).toBe('Offer');
    expect(result.offers.price).toBe('0');
    expect(result.offers.priceCurrency).toBe('USD');
  });
});

describe('generateFAQSchema', () => {
  const faqs = [
    { question: 'What is Next.js?', answer: 'A React framework.' },
    { question: 'What is TypeScript?', answer: 'A typed superset of JavaScript.' },
  ];

  it('returns FAQPage type', () => {
    expect(generateFAQSchema(faqs)['@type']).toBe('FAQPage');
  });

  it('creates one Question per FAQ entry', () => {
    const result = generateFAQSchema(faqs);
    expect(result.mainEntity).toHaveLength(2);
    expect(result.mainEntity[0]['@type']).toBe('Question');
    expect(result.mainEntity[0].name).toBe('What is Next.js?');
  });

  it('wraps each answer in an Answer node', () => {
    const result = generateFAQSchema(faqs);
    expect(result.mainEntity[0].acceptedAnswer['@type']).toBe('Answer');
    expect(result.mainEntity[0].acceptedAnswer.text).toBe('A React framework.');
  });

  it('returns empty mainEntity for empty input', () => {
    expect(generateFAQSchema([]).mainEntity).toHaveLength(0);
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
