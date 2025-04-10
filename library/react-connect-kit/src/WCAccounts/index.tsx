/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { createSafeContext } from '@w3ux/hooks'
import type { HardwareAccount } from '@w3ux/types'
import { ellipsisFn } from '@w3ux/utils'
import type { ReactNode } from 'react'
import { useState } from 'react'
import type { WCAccountsContextInterface } from './types'
import { getLocalWcAccounts, isLocalNetworkAddress } from './utils'

export const [WCAccountsContext, useWcAccounts] =
  createSafeContext<WCAccountsContextInterface>()

export const WCAccountsProvider = ({ children }: { children: ReactNode }) => {
  const [wcAccounts, setWcAccounts] =
    useState<HardwareAccount[]>(getLocalWcAccounts())

  // Check if a Wallet Connect address exists in imported addresses.
  const wcAccountExists = (network: string, address: string) =>
    !!wcAccounts.find((a) => a.address === address && a.network === network)

  // Adds a wallet connect account to state and local storage.
  const addWcAccount = (
    network: string,
    address: string,
    index: number,
    callback?: () => void
  ) => {
    let newAccounts = [...wcAccounts]

    if (!newAccounts.find((a) => isLocalNetworkAddress(network, a, address))) {
      const account: HardwareAccount = {
        address,
        network,
        name: ellipsisFn(address),
        source: 'wallet_connect',
        index,
      }

      newAccounts = [...newAccounts].concat(account)
      localStorage.setItem(
        'wallet_connect_accounts',
        JSON.stringify(newAccounts)
      )
      setWcAccounts(newAccounts)
      // Handle optional callback function
      if (typeof callback === 'function') {
        callback()
      }
      return account
    }
    return null
  }

  const removeWcAccount = (
    network: string,
    address: string,
    callback?: () => void
  ) => {
    let newAccounts = [...wcAccounts]

    newAccounts = newAccounts.filter((a) => {
      if (a.address !== address) {
        return true
      }
      if (a.network !== network) {
        return true
      }
      return false
    })

    if (!newAccounts.length) {
      localStorage.removeItem('wallet_connect_accounts')
    } else {
      localStorage.setItem(
        'wallet_connect_accounts',
        JSON.stringify(newAccounts)
      )
    }
    setWcAccounts(newAccounts)

    // Handle optional callback function.
    if (typeof callback === 'function') {
      callback()
    }
  }

  const getWcAccount = (network: string, address: string) =>
    wcAccounts.find((a) => a.address === address && a.network === network)

  const renameWcAccount = (
    network: string,
    address: string,
    newName: string
  ) => {
    const newAccounts = [...wcAccounts].map((a) =>
      isLocalNetworkAddress(network, a, address)
        ? {
            ...a,
            name: newName,
          }
        : a
    )
    localStorage.setItem('wallet_connect_accounts', JSON.stringify(newAccounts))

    setWcAccounts(newAccounts)
  }

  // Gets Wallet Connect accounts for a network.
  const getWcAccounts = (network: string) =>
    wcAccounts.filter((a) => a.network === network)

  return (
    <WCAccountsContext.Provider
      value={{
        wcAccountExists,
        addWcAccount,
        removeWcAccount,
        renameWcAccount,
        getWcAccount,
        getWcAccounts,
      }}
    >
      {children}
    </WCAccountsContext.Provider>
  )
}
