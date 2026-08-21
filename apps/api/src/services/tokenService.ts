import { createHmac, randomBytes } from 'node:crypto';
import { env } from '../config/env.js';

function ttl(value: string) {
  const match = value.match(/^(\d+)([smhd])$/);
  if (!match) return 900000;

  const units = {
    s: 1000,
    m: 60000,
    h: 3600000,
    d: 86400000
  } as const;

  return Number(match[1]) * units[match[2] as keyof typeof units];
}

function sign(payload: Record<string, unknown>, secret: string) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${createHmac('sha256', secret).update(body).digest('base64url')}`;
}

export function createAccessToken(user: { id: string; role: string }) {
  return sign(
    {
      sub: user.id,
      role: user.role,
      exp: Date.now() + ttl(env.ACCESS_TOKEN_TTL)
    },
    env.JWT_ACCESS_SECRET
  );
}

export function createRefreshToken(userId: string) {
  return sign(
    {
      sub: userId,
      exp: Date.now() + ttl(env.REFRESH_TOKEN_TTL),
      nonce: randomBytes(12).toString('hex')
    },
    env.JWT_REFRESH_SECRET
  );
}

export function decodeRefreshToken(token: string) {
  const [body, signature] = token.split('.');

  const expected = createHmac('sha256', env.JWT_REFRESH_SECRET)
    .update(body)
    .digest('base64url');

  if (signature !== expected) {
    throw new Error('invalid');
  }

  const payload = JSON.parse(
    Buffer.from(body, 'base64url').toString('utf8')
  ) as { sub: string; exp: number };

  if (payload.exp < Date.now()) {
    throw new Error('expired');
  }

  return payload;
}