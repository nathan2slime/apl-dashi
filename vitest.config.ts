import { resolve } from 'node:path';
import swc from 'unplugin-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      all: true,
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/tests/**',
        'src/**/mocks/**',
        'src/**/generated/**',
        'src/@types/**',
        'src/main.ts',
        'src/app/app.module.ts'
      ]
    }
  },
  plugins: [
    tsconfigPaths(),
    swc.vite({
      module: { type: 'es6' }
    })
  ],
  resolve: {
    alias: {
      src: resolve(__dirname, './src')
    }
  }
});
