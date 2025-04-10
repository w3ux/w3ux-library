/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { ProcessExtensionAccountsResult } from '@w3ux/types'

export const defaultProcessExtensionResult: ProcessExtensionAccountsResult = {
  newAccounts: [],
  removedAccounts: [],
}

// Local storage active extensions key
export const activeExtensionsKey = 'active_extensions'
