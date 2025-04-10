/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { ExtensionAccount } from './extensions'

export type AccountSource = 'extension' | 'external' | 'ledger' | 'vault'

export type AccountAddedBy = 'system' | 'user'

export type ImportedAccount =
  | ExtensionAccount
  | HardwareAccount
  | ExternalAccount

export interface ExternalAccount {
  address: string
  network: string
  name: string
  source: string
  addedBy: AccountAddedBy
}

export interface HardwareAccount {
  address: string
  network: string
  name: string
  source: string
  index: number
}
