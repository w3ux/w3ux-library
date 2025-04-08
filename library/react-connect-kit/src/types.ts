/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { ExtensionInjected } from '@w3ux/types'

// TODO: Remove once observable refactor is in place
declare global {
  interface Window {
    injectedWeb3?: Record<string, ExtensionInjected>
  }
}

export * from './ExtensionAccountsProvider/types'
export * from './ExtensionsProvider/types'
export * from './LedgerAccountsProvider/types'
export * from './VaultAccountsProvider/types'
