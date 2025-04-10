/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { ExtensionAccount } from './extensions'

export type AccountSource = 'extension' | HardwareAccountSource | 'external'

export type HardwareAccountSource = 'ledger' | 'vault' | 'wallet_connect'

export type AccountAddedBy = 'system' | 'user'

export type ImportedAccount =
  | ExtensionAccount
  | ExternalAccount
  | HardwareAccount

export interface ExternalAccount {
  address: string
  network: string
  name: string
  source: 'external'
  addedBy: AccountAddedBy
}

export interface HardwareAccount {
  address: string
  network: string
  name: string
  source: HardwareAccountSource
  index: number
}
