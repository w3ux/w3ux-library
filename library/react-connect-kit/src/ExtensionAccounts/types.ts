/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { Account, Sync } from '@w3ux/types'
import type { ReactNode } from 'react'

export interface ExtensionAccountsContextInterface {
  extensionsInitialised: string[]
  connectExtension: (id: string) => Promise<boolean>
  extensionsSynced: Sync
  getExtensionAccounts: (ss58: number) => Account[]
}

export interface ExtensionAccountsProviderProps {
  children: ReactNode
  ss58: number
  dappName: string
}
