/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { createSafeContext } from '@w3ux/hooks'
import {
  _reconnectSync,
  accounts$,
  addUnsub,
  processExtensionAccounts,
  reconnectExtensions,
  reconnectSync$,
  resetAccounts,
  unsubAll,
} from '@w3ux/observables-connect/accounts'
import {
  connectExtensions,
  initialisedExtensions$,
} from '@w3ux/observables-connect/extensions'
import type { ImportedAccount, Sync } from '@w3ux/types'
import { formatAccountSs58 } from '@w3ux/utils'
import { useEffect, useState } from 'react'
import { combineLatest } from 'rxjs'
import { useExtensions } from '../ExtensionsProvider'
import type {
  ExtensionAccountsContextInterface,
  ExtensionAccountsProviderProps,
} from './types'

export const [ExtensionAccountsContext, useExtensionAccounts] =
  createSafeContext<ExtensionAccountsContextInterface>()

export const ExtensionAccountsProvider = ({
  children,
  ss58,
  dappName,
}: ExtensionAccountsProviderProps) => {
  const {
    extensionsStatus,
    gettingExtensions,
    extensionHasFeature,
    extensionCanConnect,
  } = useExtensions()

  // Store connected extension accounts
  const [extensionAccounts, setExtensionAccounts] = useState<ImportedAccount[]>(
    []
  )
  // Stores initialised extensions
  const [extensionsInitialised, setExtensionsInitialised] = useState<string[]>(
    []
  )
  // Store whether previously enabled extensions have been re-connected
  const [extensionsSynced, setExtensionsSynced] = useState<Sync>('unsynced')

  // Connects to a single extension and processes its accounts
  const connectExtension = async (id: string): Promise<boolean> => {
    if (extensionCanConnect(id)) {
      const { connected } = await connectExtensions(dappName, [id])
      if (connected.size === 0) {
        return
      }
      const { extension } = connected.get(id)

      // If account subscriptions are not supported, simply get the account(s) from the extension,
      // otherwise, subscribe to accounts
      if (!extensionHasFeature(id, 'subscribeAccounts')) {
        const accounts = await extension.accounts.get()
        processExtensionAccounts(
          {
            source: id,
            ss58,
          },
          extension.signer,
          accounts
        )
      } else {
        const unsub = extension.accounts.subscribe((accounts) => {
          processExtensionAccounts(
            {
              source: id,
              ss58,
            },
            extension.signer,
            accounts
          )
        })
        addUnsub(id, unsub)
      }
      return true
    }
    return false
  }

  const handleSyncExtensionAccounts = async () => {
    if (!gettingExtensions && _reconnectSync.getValue() === 'unsynced') {
      // Unsubscribe from all accounts and reset state
      unsubAll()
      resetAccounts()
      // Bootstrap any previously connected to extensions
      await reconnectExtensions(dappName, ss58)
    }
  }

  // Get extension accounts based on the provided ss58 prefix
  const getExtensionAccounts = (ss58Prefix: number): ImportedAccount[] =>
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
      // Remove null entries resulting from invalid formatted addresses
      .filter((account) => account !== null)

  // Initialise extension accounts sync
  useEffect(() => {
    handleSyncExtensionAccounts()
    return () => unsubAll()
  }, [extensionsStatus, gettingExtensions])

  // Subscribes to observables and updates state
  useEffect(() => {
    const sub = combineLatest([
      initialisedExtensions$,
      accounts$,
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
        getExtensionAccounts,
      }}
    >
      {children}
    </ExtensionAccountsContext.Provider>
  )
}
