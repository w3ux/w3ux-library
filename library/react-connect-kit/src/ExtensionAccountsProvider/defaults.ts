/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */
/* eslint-disable @typescript-eslint/no-unused-vars */

import type { ExtensionAccountsContextInterface } from './types'

export const defaultExtensionAccountsContext: ExtensionAccountsContextInterface =
  {
    connectExtensionAccounts: () => Promise.resolve(false),
    extensionAccountsSynced: 'unsynced',
    getExtensionAccounts: (ss58) => [],
  }

export const defaultHandleImportExtension = {
  newAccounts: [],
  meta: {
    accountsToRemove: [],
    removedActiveAccount: null,
  },
}

export const DEFAULT_SS58 = 0
