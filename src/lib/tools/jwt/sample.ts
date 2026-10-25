/** The example the JWT tool opens with: HS256-signed with `SAMPLE_SECRET` (checked by a test). */
export const SAMPLE_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkYSBMb3ZlbGFjZSIsImFkbWluIjp0cnVlLCJpYXQiOjE3NjcyMjU2MDAsImV4cCI6NDEwMjQ0NDgwMH0.oSRRHyR1rwH6yI24SRAIFy-_kTyO5L8LIMM-VlNEAAM';

export const SAMPLE_SECRET = 'a-string-secret-at-least-256-bits-long';

export const SAMPLE_HEADER = `{
  "alg": "HS256",
  "typ": "JWT"
}`;

export const SAMPLE_PAYLOAD = `{
  "sub": "1234567890",
  "name": "Ada Lovelace",
  "admin": true,
  "iat": 1767225600,
  "exp": 4102444800
}`;
