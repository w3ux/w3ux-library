/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { WCAccount } from '@w3ux/types'
import type { ReactNode } from 'react'

export interface WCAccountsProviderProps {
  children: ReactNode
  network: string
}

export interface WCAccountsContextInterface {
  wcAccountExists: (network: string, address: string) => boolean
  addWcAccount: (
    network: string,
    address: string,
    index: number,
    callback?: () => void
  ) => WCAccount | null
  removeWcAccount: (
    network: string,
    address: string,
    callback?: () => void
  ) => void
  renameWcAccount: (network: string, address: string, newName: string) => void
  getWcAccount: (network: string, address: string) => WCAccount | null
  getWcAccounts: (network: string) => WCAccount[]
  wcAccounts: WCAccount[]
}
