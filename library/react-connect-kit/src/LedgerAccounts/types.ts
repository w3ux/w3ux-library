/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { LedgerAccount } from '@w3ux/types'
import type { ReactNode } from 'react'

export interface LedgerAccountsContextInterface {
  ledgerAccountExists: (network: string, a: string) => boolean
  addLedgerAccount: (
    network: string,
    address: string,
    index: number,
    callback?: () => void
  ) => LedgerAccount | null
  removeLedgerAccount: (
    network: string,
    address: string,
    callback?: () => void
  ) => void
  renameLedgerAccount: (network: string, address: string, name: string) => void
  getLedgerAccount: (network: string, address: string) => LedgerAccount | null
  getLedgerAccounts: (network: string) => LedgerAccount[]
  ledgerAccounts: LedgerAccount[]
}

export interface LedgerAccountsProviderProps {
  children: ReactNode
}

export interface LedgerAddress {
  address: string
  index: number
  name: string
  network: string
  pubKey: string
}
