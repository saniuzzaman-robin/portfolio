export type RotVariant = 13 | 47;

/** ROT13 rotates ASCII letters; ROT47 rotates every printable ASCII character. Both are their own inverse. */
export function rot(text: string, variant: RotVariant): string {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (variant === 47 && code >= 33 && code <= 126) {
      out += String.fromCharCode(33 + ((code - 33 + 47) % 94));
    } else if (variant === 13 && code >= 65 && code <= 90) {
      out += String.fromCharCode(65 + ((code - 65 + 13) % 26));
    } else if (variant === 13 && code >= 97 && code <= 122) {
      out += String.fromCharCode(97 + ((code - 97 + 13) % 26));
    } else out += text[i];
  }
  return out;
}
