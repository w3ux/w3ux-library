/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { ImportedAccount, Sync } from '@w3ux/types'
import type { ReactNode } from 'react'

export interface ExtensionAccountsContextInterface {
  connectExtensionAccounts: (id?: string) => Promise<boolean>
  extensionAccountsSynced: Sync
  getExtensionAccounts: (ss58: number) => ImportedAccount[]
}

export interface ExtensionAccountsProviderProps {
  children: ReactNode
  ss58: number
  dappName: string
  onExtensionEnabled?: (id: string) => void
}
