/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { HardwareAccount } from '@w3ux/types'

export interface WCAccountsContextInterface {
  wcAccountExists: (network: string, address: string) => boolean
  addWcAccount: (
    network: string,
    address: string,
    index: number,
    callback?: () => void
  ) => HardwareAccount | null
  removeWcAccount: (
    network: string,
    address: string,
    callback?: () => void
  ) => void
  renameWcAccount: (network: string, address: string, newName: string) => void
  getWcAccount: (network: string, address: string) => HardwareAccount | null
  getWcAccounts: (network: string) => HardwareAccount[]
}
