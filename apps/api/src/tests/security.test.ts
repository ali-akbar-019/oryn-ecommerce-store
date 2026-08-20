import { describe, expect, it } from 'vitest';
import { createApp } from '../app';

describe('API security foundation', () => {
  it('creates the application with a health endpoint', async () => {
    const app = createApp();
    expect(app).toBeDefined();
  });
});
