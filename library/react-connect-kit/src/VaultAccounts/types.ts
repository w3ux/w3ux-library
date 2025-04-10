/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { VaultAccount } from '@w3ux/types'
import type { ReactNode } from 'react'

export interface VaultAccountsProviderProps {
  children: ReactNode
  network: string
}

export interface VaultAccountsContextInterface {
  vaultAccountExists: (network: string, address: string) => boolean
  addVaultAccount: (
    network: string,
    address: string,
    index: number,
    callback?: () => void
  ) => VaultAccount | null
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
  getVaultAccount: (network: string, address: string) => VaultAccount | null
  getVaultAccounts: (network: string) => VaultAccount[]
  vaultAccounts: VaultAccount[]
}
