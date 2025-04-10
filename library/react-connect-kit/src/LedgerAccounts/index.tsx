/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { createSafeContext } from '@w3ux/hooks'
import type { HardwareAccount } from '@w3ux/types'
import { ellipsisFn } from '@w3ux/utils'
import type { ReactNode } from 'react'
import { useState } from 'react'
import type { LedgerAccountsContextInterface } from './types'
import { getLocalLedgerAccounts } from './utils'

export const [LedgerAccountsContext, useLedgerAccounts] =
  createSafeContext<LedgerAccountsContextInterface>()

export const LedgerAccountsProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  // Store imported ledger accounts
  const [ledgerAccounts, setLedgerAccounts] = useState<HardwareAccount[]>(
    getLocalLedgerAccounts()
  )

  // Check if a Ledger account is imported
  const ledgerAccountExists = (network: string, address: string) =>
    !!ledgerAccounts.find((a) => a.address === address && a.network === network)

  // Adds a ledger account
  const addLedgerAccount = (
    network: string,
    address: string,
    index: number,
    callback?: () => void
  ) => {
    const exists = !!ledgerAccounts.find(
      (a) => a.address === address && a.network === network
    )

    if (!exists) {
      const newAccount = {
        address,
        network,
        name: ellipsisFn(address),
        source: 'ledger',
        index,
      }
      const newLedgerAccounts = [...ledgerAccounts].concat(newAccount)
      localStorage.setItem('ledger_accounts', JSON.stringify(newLedgerAccounts))
      setLedgerAccounts(newLedgerAccounts)

      // Handle optional callback function.
      if (typeof callback === 'function') {
        callback()
      }
      return newAccount
    }
    return null
  }

  // Removes a Ledger account
  const removeLedgerAccount = (
    network: string,
    address: string,
    callback?: () => void
  ) => {
    const newLedgerAccounts = [...ledgerAccounts].filter(
      (a) => !(a.address === address && a.network === network)
    )

    if (!newLedgerAccounts.length) {
      localStorage.removeItem('ledger_accounts')
    } else {
      localStorage.setItem('ledger_accounts', JSON.stringify(newLedgerAccounts))
    }

    setLedgerAccounts(newLedgerAccounts)
    // Handle optional callback function
    if (typeof callback === 'function') {
      callback()
    }
  }

  // Renames an imported ledger account
  const renameLedgerAccount = (
    network: string,
    address: string,
    newName: string
  ) => {
    const newLedgerAccounts = [...ledgerAccounts].map((a) =>
      a.network === network && a.address === address
        ? {
            ...a,
            name: newName,
          }
        : a
    )
    localStorage.setItem('ledger_accounts', JSON.stringify(newLedgerAccounts))
    setLedgerAccounts(newLedgerAccounts)
  }

  // Gets an imported ledger account
  const getLedgerAccount = (network: string, address: string) =>
    ledgerAccounts.find(
      (a) => a.network === network && a.address === address
    ) || null

  // Gets all Ledger accounts for a network
  const getLedgerAccounts = (network: string) =>
    ledgerAccounts.filter((a) => a.network === network)

  return (
    <LedgerAccountsContext.Provider
      value={{
        ledgerAccountExists,
        getLedgerAccount,
        addLedgerAccount,
        removeLedgerAccount,
        renameLedgerAccount,
        getLedgerAccounts,
      }}
    >
      {children}
    </LedgerAccountsContext.Provider>
  )
}
