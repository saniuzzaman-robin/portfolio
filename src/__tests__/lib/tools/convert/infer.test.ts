import { describe, it, expect } from 'vitest';
import { inferShape, singular, toTypeScript, toZod, typeName } from '@/lib/tools/convert/infer';
import { parseJson } from '@/lib/tools/json/parse';

const shape = (text: string) => {
  const parsed = parseJson(text);
  if (!parsed.ok) throw new Error(parsed.error.message);
  return inferShape(parsed.value);
};

const USERS = `{
  "page": 1,
  "users": [
    { "id": 1, "name": "Ada", "email": null, "address": { "city": "Oslo" }, "tags": ["a"] },
    { "id": 2, "name": "Linus", "email": "l@x.dev", "nick-name": "lt", "tags": [] }
  ],
  "meta": {}
}`;

describe('toTypeScript', () => {
  it('merges array items into one interface with optional fields and unions', () => {
    expect(toTypeScript(shape(USERS), 'Root')).toBe(
      `export interface Root {
  page: number;
  users: User[];
  meta: Record<string, unknown>;
}

export interface User {
  id: number;
  name: string;
  email: string | null;
  address?: Address;
  tags: string[];
  "nick-name"?: string;
}

export interface Address {
  city: string;
}
`
    );
  });

  it('writes a type alias for a non-object root and parenthesizes union arrays', () => {
    expect(toTypeScript(shape('[{"a":1},{"a":"x"}]'), 'Root')).toBe(
      'export type Root = RootItem[];\n\nexport interface RootItem {\n  a: string | number;\n}\n'
    );
    expect(toTypeScript(shape('[1,"x",null,[]]'), 'Values')).toBe(
      'export type Values = (unknown[] | string | number | null)[];\n'
    );
  });

  it('gives clashing names a numeric suffix', () => {
    expect(toTypeScript(shape('{"a":{"item":{"x":1}},"b":{"item":{"y":1}}}'), 'Root')).toContain(
      'export interface Item2 {\n  y: number;\n}'
    );
  });
});

describe('toZod', () => {
  it('declares nested schemas before the ones that use them', () => {
    expect(toZod(shape(USERS), 'Root')).toBe(
      `import { z } from 'zod';

export const AddressSchema = z.object({
  city: z.string(),
});

export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().nullable(),
  address: AddressSchema.optional(),
  tags: z.array(z.string()),
  "nick-name": z.string().optional(),
});

export const RootSchema = z.object({
  page: z.number(),
  users: z.array(UserSchema),
  meta: z.record(z.string(), z.unknown()),
});

export type Root = z.infer<typeof RootSchema>;
`
    );
  });

  it('writes unions, null and unknown', () => {
    expect(toZod(shape('[1,"x",null,[]]'), 'Values')).toContain(
      'export const ValuesSchema = z.array(z.union([z.array(z.unknown()), z.string(), z.number()]).nullable());'
    );
    expect(toZod(shape('null'), 'Root')).toContain('export const RootSchema = z.null();');
  });
});

describe('names', () => {
  it('builds PascalCase type names', () => {
    expect(typeName('user_profile')).toBe('UserProfile');
    expect(typeName('createdAt')).toBe('CreatedAt');
    expect(typeName('nick-name')).toBe('NickName');
    expect(typeName('2fa')).toBe('T2fa');
    expect(typeName('---')).toBe('Item');
  });

  it('singularizes array names', () => {
    expect(singular('users')).toBe('user');
    expect(singular('categories')).toBe('category');
    expect(singular('status')).toBe('statusItem');
    expect(singular('data')).toBe('dataItem');
  });
});
