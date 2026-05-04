import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  dts: false,
  clean: true,
  target: 'node18',
  external: ['path', 'fs', 'os'],
  noExternal: [],
})
