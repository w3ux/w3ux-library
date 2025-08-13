/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { ExtensionInjected } from '@w3ux/types'

declare global {
	interface Window {
		injectedWeb3?: Record<string, ExtensionInjected>
	}
}
