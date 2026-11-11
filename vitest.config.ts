import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['v1/src/**/*.test.ts', 'v2/src/**/*.test.ts', 'v3/src/**/*.test.ts'] } });
