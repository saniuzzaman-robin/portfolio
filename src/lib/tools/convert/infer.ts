import type { JsonNode } from '@/lib/tools/json/parse';

/* Type inference for JSON → TypeScript / Zod. Every value seen at a position is merged into one
   `Shape`: objects merge field by field (a field missing from some objects becomes optional),
   array items merge into one element shape, and different kinds become a union. */

type Primitive = 'string' | 'number' | 'boolean';

export type Shape = {
  primitives: Set<Primitive>;
  nullable: boolean;
  object?: ObjectShape;
  /** The merged shape of every array item seen here (empty when the arrays were empty). */
  array?: Shape;
};

type ObjectShape = {
  fields: Map<string, { shape: Shape; seen: number }>;
  /** How many objects were merged; a field seen fewer times is optional. */
  count: number;
};

const emptyShape = (): Shape => ({ primitives: new Set(), nullable: false });

export function inferShape(node: JsonNode): Shape {
  const shape = emptyShape();
  add(shape, node);
  return shape;
}

function add(shape: Shape, node: JsonNode) {
  switch (node.type) {
    case 'null':
      shape.nullable = true;
      break;
    case 'string':
    case 'number':
    case 'boolean':
      shape.primitives.add(node.type);
      break;
    case 'array':
      shape.array ??= emptyShape();
      for (const item of node.items) add(shape.array, item);
      break;
    case 'object': {
      const object = (shape.object ??= { fields: new Map(), count: 0 });
      object.count++;
      const seen = new Set<string>();
      for (const { key, value } of node.entries) {
        let field = object.fields.get(key);
        if (!field) {
          field = { shape: emptyShape(), seen: 0 };
          object.fields.set(key, field);
        }
        if (!seen.has(key)) field.seen++;
        seen.add(key);
        add(field.shape, value);
      }
      break;
    }
  }
}

const PRIMITIVE_ORDER: Primitive[] = ['string', 'number', 'boolean'];
const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

const propertyKey = (key: string) => (IDENTIFIER.test(key) ? key : JSON.stringify(key));

/** `user_profile` → `UserProfile`; names that can't start an identifier get a `T` prefix. */
export function typeName(hint: string): string {
  const words = hint
    .replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, '$1 $2')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
  const name = words.map((word) => word[0].toUpperCase() + word.slice(1)).join('');
  if (name === '') return 'Item';
  return /^\p{N}/u.test(name) ? `T${name}` : name;
}

/** Name for an array's items: `users` → `user`, `categories` → `category`, `data` → `dataItem`. */
export function singular(hint: string): string {
  if (/[^aeiou]ies$/i.test(hint)) return `${hint.slice(0, -3)}y`;
  if (/(?:ss|us|is)$/i.test(hint) || !/s$/i.test(hint)) return `${hint}Item`;
  return hint.slice(0, -1);
}

/** Hands out unique type names: `Address`, then `Address2`… */
class Names {
  private used = new Set<string>();

  take(hint: string): string {
    const base = typeName(hint);
    let name = base;
    for (let suffix = 2; this.used.has(name); suffix++) name = `${base}${suffix}`;
    this.used.add(name);
    return name;
  }
}

const isOnlyObject = (shape: Shape) =>
  shape.object !== undefined &&
  shape.object.fields.size > 0 &&
  !shape.array &&
  !shape.nullable &&
  shape.primitives.size === 0;

/** TypeScript interfaces for the shape, the root first, nested types after their parent. */
export function toTypeScript(root: Shape, rootName: string): string {
  const names = new Names();
  const declarations: string[] = [];

  const declare = (object: ObjectShape, hint: string): string => {
    if (object.fields.size === 0) return 'Record<string, unknown>';
    const name = names.take(hint);
    const index = declarations.push('') - 1;
    const lines = [...object.fields].map(([key, field]) => {
      const optional = field.seen < object.count ? '?' : '';
      return `  ${propertyKey(key)}${optional}: ${expression(field.shape, key)};`;
    });
    declarations[index] = `export interface ${name} {\n${lines.join('\n')}\n}`;
    return name;
  };

  const expression = (shape: Shape, hint: string): string => {
    const parts: string[] = [];
    if (shape.object) parts.push(declare(shape.object, hint));
    if (shape.array) {
      const item = expression(shape.array, singular(hint));
      parts.push(item.includes(' | ') ? `(${item})[]` : `${item}[]`);
    }
    for (const primitive of PRIMITIVE_ORDER)
      if (shape.primitives.has(primitive)) parts.push(primitive);
    if (shape.nullable) parts.push('null');
    return parts.length ? parts.join(' | ') : 'unknown';
  };

  if (isOnlyObject(root) && root.object) {
    declare(root.object, rootName);
  } else {
    const name = names.take(rootName);
    const index = declarations.push('') - 1;
    declarations[index] = `export type ${name} = ${expression(root, rootName)};`;
  }
  return `${declarations.join('\n\n')}\n`;
}

/** Zod schemas for the shape (dependencies first) and the inferred root type. */
export function toZod(root: Shape, rootName: string): string {
  const names = new Names();
  const declarations: string[] = [];

  const declare = (object: ObjectShape, hint: string, name = names.take(hint)): string => {
    if (object.fields.size === 0) return 'z.record(z.string(), z.unknown())';
    const lines = [...object.fields].map(([key, field]) => {
      const optional = field.seen < object.count ? '.optional()' : '';
      return `  ${propertyKey(key)}: ${expression(field.shape, key)}${optional},`;
    });
    declarations.push(`export const ${name}Schema = z.object({\n${lines.join('\n')}\n});`);
    return `${name}Schema`;
  };

  const expression = (shape: Shape, hint: string): string => {
    const options: string[] = [];
    if (shape.object) options.push(declare(shape.object, hint));
    if (shape.array) options.push(`z.array(${expression(shape.array, singular(hint))})`);
    for (const primitive of PRIMITIVE_ORDER) {
      if (shape.primitives.has(primitive)) options.push(`z.${primitive}()`);
    }
    if (options.length === 0) return shape.nullable ? 'z.null()' : 'z.unknown()';
    const base = options.length === 1 ? options[0] : `z.union([${options.join(', ')}])`;
    return shape.nullable ? `${base}.nullable()` : base;
  };

  const name = names.take(rootName);
  if (isOnlyObject(root) && root.object) {
    declare(root.object, rootName, name);
  } else {
    declarations.push(`export const ${name}Schema = ${expression(root, rootName)};`);
  }
  return (
    [
      "import { z } from 'zod';",
      ...declarations,
      `export type ${name} = z.infer<typeof ${name}Schema>;`,
    ].join('\n\n') + '\n'
  );
}
