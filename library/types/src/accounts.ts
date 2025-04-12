/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

export type HardwareAccountSource = 'ledger' | 'vault' | 'wallet_connect'

export type Account = ExtensionAccount | HardwareAccount

export type ExtensionAccount = AccountCommon & {
  signer?: unknown
}

export type HardwareAccount = AccountCommon & {
  network: string
  index: number
}

export interface AccountCommon {
  address: string
  name: string
  source: string
}
