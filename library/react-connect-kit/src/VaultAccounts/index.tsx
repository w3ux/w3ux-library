/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { createSafeContext } from '@w3ux/hooks'
import type { HardwareAccount } from '@w3ux/types'
import { ellipsisFn } from '@w3ux/utils'
import type { ReactNode } from 'react'
import { useState } from 'react'
import type { VaultAccountsContextInterface } from './types'
import { getLocalVaultAccounts, isLocalNetworkAddress } from './utils'

export const [VaultAccountsContext, useVaultAccounts] =
  createSafeContext<VaultAccountsContextInterface>()

export const VaultAccountsProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const [vaultAccounts, seVaultAccounts] = useState<HardwareAccount[]>(
    getLocalVaultAccounts()
  )

  // Check if a Vault address exists in imported addresses.
  const vaultAccountExists = (network: string, address: string) =>
    !!vaultAccounts.find((a) => a.address === address && a.network === network)

  // Adds a vault account to state and local storage.
  const addVaultAccount = (
    network: string,
    address: string,
    index: number,
    callback?: () => void
  ) => {
    let newVaultAccounts = getLocalVaultAccounts()

    if (
      !newVaultAccounts.find((a) => isLocalNetworkAddress(network, a, address))
    ) {
      const account: HardwareAccount = {
        address,
        network,
        name: ellipsisFn(address),
        source: 'vault',
        index,
      }

      newVaultAccounts = [...newVaultAccounts].concat(account)
      localStorage.setItem(
        'polkadot_vault_accounts',
        JSON.stringify(newVaultAccounts)
      )
      seVaultAccounts(newVaultAccounts)

      // Handle optional callback function.
      if (typeof callback === 'function') {
        callback()
      }
      return account
    }
    return null
  }

  const removeVaultAccount = (
    network: string,
    address: string,
    callback?: () => void
  ) => {
    let newVaultAccounts = getLocalVaultAccounts()

    newVaultAccounts = newVaultAccounts.filter((a) => {
      if (a.address !== address) {
        return true
      }
      if (a.network !== network) {
        return true
      }
      return false
    })

    if (!newVaultAccounts.length) {
      localStorage.removeItem('polkadot_vault_accounts')
    } else {
      localStorage.setItem(
        'polkadot_vault_accounts',
        JSON.stringify(newVaultAccounts)
      )
    }
    seVaultAccounts(newVaultAccounts)

    // Handle optional callback function.
    if (typeof callback === 'function') {
      callback()
    }
  }

  const getVaultAccount = (network: string, address: string) => {
    const localVaultAccounts = getLocalVaultAccounts()
    if (!localVaultAccounts) {
      return null
    }
    return (
      localVaultAccounts.find((a) =>
        isLocalNetworkAddress(network, a, address)
      ) ?? null
    )
  }

  const renameVaultAccount = (
    network: string,
    address: string,
    newName: string
  ) => {
    let newVaultAccounts = getLocalVaultAccounts()

    newVaultAccounts = newVaultAccounts.map((a) =>
      isLocalNetworkAddress(network, a, address)
        ? {
            ...a,
            name: newName,
          }
        : a
    )
    localStorage.setItem(
      'polkadot_vault_accounts',
      JSON.stringify(newVaultAccounts)
    )
    seVaultAccounts(newVaultAccounts)
  }

  // Gets Vault accounts for a network.
  const getVaultAccounts = (network: string) =>
    vaultAccounts.filter((a) => a.network === network)

  return (
    <VaultAccountsContext.Provider
      value={{
        vaultAccountExists,
        addVaultAccount,
        removeVaultAccount,
        renameVaultAccount,
        getVaultAccount,
        getVaultAccounts,
      }}
    >
      {children}
    </VaultAccountsContext.Provider>
  )
}
