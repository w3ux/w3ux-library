/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { HardwareAccount } from '@w3ux/types'

export interface VaultAccountsContextInterface {
  vaultAccountExists: (network: string, address: string) => boolean
  addVaultAccount: (
    network: string,
    address: string,
    index: number,
    callback?: () => void
  ) => HardwareAccount | null
  removeVaultAccount: (
    network: string,
    address: string,
    callback?: () => void
  ) => void
  renameVaultAccount: (
    network: string,
    address: string,
    newName: string
  ) => void
  getVaultAccount: (network: string, address: string) => HardwareAccount | null
  getVaultAccounts: (network: string) => HardwareAccount[]
}
