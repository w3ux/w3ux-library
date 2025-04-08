/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { HandleImportExtension } from '@w3ux/types'

export const DefaultHandleImportExtension: HandleImportExtension = {
  newAccounts: [],
  meta: {
    accountsToRemove: [],
    removedActiveAccount: null,
  },
}

// The default ss58 prefix accounts are formatted to
export const DefaultSS58 = 0

// Local storage active extensions key
export const ActiveExtensionsKey = 'active_extensions'
