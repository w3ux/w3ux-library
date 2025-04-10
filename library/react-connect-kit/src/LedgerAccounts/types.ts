/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { HardwareAccount } from '@w3ux/types'

export interface LedgerAccountsContextInterface {
  ledgerAccountExists: (network: string, a: string) => boolean
  addLedgerAccount: (
    network: string,
    address: string,
    index: number,
    callback?: () => void
  ) => HardwareAccount | null
  removeLedgerAccount: (
    network: string,
    address: string,
    callback?: () => void
  ) => void
  renameLedgerAccount: (network: string, address: string, name: string) => void
  getLedgerAccount: (network: string, address: string) => HardwareAccount | null
  getLedgerAccounts: (network: string) => HardwareAccount[]
}
