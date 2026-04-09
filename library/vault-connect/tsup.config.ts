/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { defineConfig } from 'tsup'

export default defineConfig({
	entry: ['src/index.ts', 'src/hooks/index.ts', 'src/qrcode/index.ts'],
	target: 'esnext',
	sourcemap: true,
	clean: true,
	dts: true,
	format: ['esm', 'cjs'],
	external: ['react', 'react-dom', 'dedot', '@w3ux/react-connect-kit'],
})
