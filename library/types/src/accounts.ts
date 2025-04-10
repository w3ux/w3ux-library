/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { ExtensionAccount } from './extensions'

export type AccountSource = 'extension' | 'external' | 'ledger' | 'vault'

export type AccountAddedBy = 'system' | 'user'

export type ImportedAccount =
  | ExtensionAccount
  | ExternalAccount
  | LedgerAccount
  | VaultAccount
  | WCAccount

export interface ExternalAccount {
  address: string
  network: string
  name: string
  source: string
  addedBy: AccountAddedBy
}

export interface LedgerAccount {
  address: string
  network: string
  name: string
  source: string
  index: number
}

export interface VaultAccount {
  address: string
  network: string
  name: string
  source: string
  index: number
}

export interface WCAccount {
  address: string
  network: string
  name: string
  source: string
  index: number
}
