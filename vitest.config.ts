import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      all: true,
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/__generated__/**',
        'src/**/index.ts',
        'src/cli.ts'
      ],
      lines: 90,
      functions: 90,
      branches: 90,
      statements: 90,
      // Enforce 100% for core + utils (unit responsibility)
      thresholds: {
        'src/core/': { lines: 100, functions: 100, branches: 100, statements: 100 },
        'src/utils/': { lines: 100, functions: 100, branches: 100, statements: 100 }
      }
    }
  }
});
