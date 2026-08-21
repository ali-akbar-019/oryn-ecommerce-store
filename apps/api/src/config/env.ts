import { config } from 'dotenv';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const envPath = join(__dirname, '../../../../.env');

console.log('Loading .env from:', envPath);
config({ path: envPath });

const schema = z.object({
  API_PORT: z.coerce.number().default(4000),
  API_BASE_URL: z.string().default('http://localhost:4000'),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL: z.string().default('7d'),
  CORS_ORIGINS: z.string()
    .default('http://localhost:5173,http://localhost:8081')
    .transform((v) => v.split(',').map((x) => x.trim()).filter(Boolean)),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export const env = schema.parse(process.env);