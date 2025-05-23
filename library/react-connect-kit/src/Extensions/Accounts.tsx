/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { createSafeContext } from '@w3ux/hooks'
import {
  extensionAccounts$,
  getReconnectSync,
  initialisedExtensions$,
  reconnectSync$,
  resetAccounts,
} from '@w3ux/observables-connect'
import { unsubAll } from '@w3ux/observables-connect/accounts'
import {
  connectExtension as doConnectExtension,
  reconnectExtensions,
} from '@w3ux/observables-connect/extensions'
import type { Account, ExtensionAccount, Sync } from '@w3ux/types'
import { formatAccountSs58 } from '@w3ux/utils'
import { useEffect, useState } from 'react'
import { combineLatest } from 'rxjs'
import { useExtensions } from './Connect'
import type {
  ExtensionAccountsContextInterface,
  ExtensionsProviderProps,
} from './types'

export const [ExtensionAccountsContext, useExtensionAccounts] =
  createSafeContext<ExtensionAccountsContextInterface>()

export const ExtensionAccountsProvider = ({
  children,
  ss58,
  dappName,
}: ExtensionsProviderProps) => {
  const { gettingExtensions } = useExtensions()

  // Store connected extension accounts
  const [extensionAccounts, setExtensionAccounts] = useState<Account[]>([])
  // Stores initialised extensions
  const [extensionsInitialised, setExtensionsInitialised] = useState<string[]>(
    []
  )
  // Store whether previously enabled extensions have been re-connected
  const [extensionsSynced, setExtensionsSynced] =
    useState<Sync>(getReconnectSync())

  // Handle initial connection to previously enabled extensions
  const handleInitialConnect = async () => {
    if (!gettingExtensions && extensionsSynced === 'unsynced') {
      // Defensive: unsubscribe from all accounts and reset state
      unsubAll()
      resetAccounts()
      await reconnectExtensions(dappName, ss58)
    }
  }

  // Connects to a single extension and processes its accounts
  const connectExtension = async (id: string): Promise<boolean> =>
    await doConnectExtension(dappName, ss58, id)

  // Get extension accounts, formatted by a provided ss58 prefix
  const getExtensionAccounts = (ss58Prefix: number) =>
    extensionAccounts
      .map((account) => {
        const formattedAddress = formatAccountSs58(account.address, ss58Prefix)
        if (!formattedAddress) {
          return null
        }
        return {
          ...account,
          address: formattedAddress,
        }
      })
      .filter((account) => account !== null)

  // Get an imported extension account
  const getExtensionAccount = (
    address: string
  ): ExtensionAccount | undefined => {
    const account = extensionAccounts.find(
      (item) =>
        formatAccountSs58(item.address, 0) === formatAccountSs58(address, 0)
    )
    return account ? { ...account, address } : undefined
  }

  // Initialise extension accounts sync
  useEffect(() => {
    handleInitialConnect()
    return () => unsubAll()
  }, [gettingExtensions])

  // Subscribes to observables and updates state
  useEffect(() => {
    const sub = combineLatest([
      initialisedExtensions$,
      extensionAccounts$,
      reconnectSync$,
    ]).subscribe(([initialised, accounts, sync]) => {
      setExtensionsInitialised(initialised)
      setExtensionAccounts(accounts)
      setExtensionsSynced(sync)
    })
    return () => {
      sub.unsubscribe()
    }
  }, [])

  return (
    <ExtensionAccountsContext.Provider
      value={{
        extensionsInitialised,
        connectExtension,
        extensionsSynced,
        getExtensionAccount,
        getExtensionAccounts,
      }}
    >
      {children}
    </ExtensionAccountsContext.Provider>
  )
}
