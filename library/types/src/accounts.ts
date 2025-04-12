/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

export type HardwareAccountSource = 'ledger' | 'vault' | 'wallet_connect'

export type AccountAddedBy = 'system' | 'user'

export type ImportedAccount =
  | ExtensionAccount
  | ExternalAccount
  | HardwareAccount

export interface AccountCommon {
  address: string
  name: string
  source: string
}

export type ExtensionAccount = AccountCommon & {
  signer?: unknown
}

export type HardwareAccount = AccountCommon & {
  network: string
  index: number
}

export type ExternalAccount = AccountCommon & {
  network: string
  addedBy: AccountAddedBy
}
