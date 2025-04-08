/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { HandleImportExtension } from '@w3ux/types'

export const defaultHandleImportExtension: HandleImportExtension = {
  newAccounts: [],
  meta: {
    accountsToRemove: [],
    removedActiveAccount: null,
  },
}

export const DEFAULT_SS58 = 0
