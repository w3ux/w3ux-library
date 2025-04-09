/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { createSafeContext, useEffectIgnoreInitial } from '@w3ux/hooks'
import {
  accounts$,
  addUnsub,
  getAccountsFromExtensions,
  processExtensionAccounts,
  resetAccounts,
  unsubAll,
  updateAccounts,
} from '@w3ux/observables-connect/accounts'
import {
  connectExtensions,
  getActiveExtensionsLocal,
  initialisedExtensions$,
} from '@w3ux/observables-connect/extensions'
import type {
  ExtensionAccount,
  ImportedAccount,
  ProcessExtensionAccountsResult,
  Sync,
} from '@w3ux/types'
import { formatAccountSs58, localStorageOrDefault } from '@w3ux/utils'
import { useEffect, useState } from 'react'
import { combineLatest } from 'rxjs'
import { useExtensions } from '../ExtensionsProvider'
import type {
  ExtensionAccountsContextInterface,
  ExtensionAccountsProviderProps,
} from './types'
import {
  connectActiveExtensionAccount,
  getActiveAccountLocal,
  getActiveExtensionAccount,
} from './utils'

export const [ExtensionAccountsContext, useExtensionAccounts] =
  createSafeContext<ExtensionAccountsContextInterface>()

export const ExtensionAccountsProvider = ({
  children,
  network,
  ss58,
  dappName,
  activeAccount,
  setActiveAccount,
  onExtensionEnabled,
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

  // Store whether extension accounts have been synced
  // TODO: Use observable to update this state
  const [extensionAccountsSynced, setExtensionAccountsSynced] =
    useState<Sync>('unsynced')

  // Helper for setting active account. Ignores if not a valid function
  const maybeSetActiveAccount = (address: string) => {
    if (typeof setActiveAccount === 'function') {
      setActiveAccount(address ?? null)
    }
  }

  // Helper for calling extension enabled callback. Ignores if not a valid function
  const maybeOnExtensionEnabled = (id: string) => {
    if (typeof onExtensionEnabled === 'function') {
      onExtensionEnabled(id)
    }
  }

  const connectToAccount = (account: ImportedAccount | null) => {
    maybeSetActiveAccount(account?.address ?? null)
  }

  // Connects to extensions that already have been connected to and stored in localStorage. Loop
  // through extensions and connect to accounts. If `activeAccount` exists locally, we wait until
  // all extensions are looped before connecting to it; there is no guarantee it still exists - must
  // explicitly find it
  const connectActiveExtensions = async () => {
    const { connected } = await connectExtensions(
      dappName,
      getActiveExtensionsLocal()
    )
    if (connected.size === 0) {
      return
    }

    // Get full list of imported accounts
    const initialAccounts = await getAccountsFromExtensions(connected, ss58)

    // Get the active account if found in initial accounts. Format initial account addresses to the
    // correct ss58 format before finding
    const activeAccountInInitial = initialAccounts
      .map((acc) => ({
        ...acc,
        address: formatAccountSs58(acc.address, ss58),
      }))
      .find(({ address }) => address === getActiveAccountLocal(network, ss58))

    // Perform initial account state update
    updateAccounts({ add: initialAccounts, remove: [] })

    // Initiate account subscriptions for connected extensions
    // --------------------------------------------------------

    // Handler function for each extension accounts subscription
    const handleAccounts = (
      extensionId: string,
      accounts: ExtensionAccount[],
      signer: unknown
    ) => {
      const result = processExtensionAccounts(
        {
          source: extensionId,
          network,
          ss58,
        },
        signer,
        accounts
      )
      return result
    }

    // Try to subscribe to accounts for each connected extension
    for (const [id, { extension }] of Array.from(connected.entries())) {
      // If enabled, subscribe to accounts.
      if (extensionHasFeature(id, 'subscribeAccounts')) {
        const unsub = extension.accounts.subscribe((accounts) => {
          handleAccounts(id, accounts || [], extension.signer)
        })
        // Store unsub
        addUnsub(id, unsub)
      }
    }

    // Connect to active account if found in initial accounts
    if (activeAccountInInitial) {
      connectActiveExtensionAccount(activeAccountInInitial, connectToAccount)
    }
  }

  // Connects to a single extension. If activeAccount is not found here, it is simply ignored
  const connectExtensionAccounts = async (id: string): Promise<boolean> => {
    if (extensionCanConnect(id)) {
      const { connected } = await connectExtensions(dappName, [id])
      if (connected.size === 0) {
        return
      }
      const { extension } = connected.get(id)

      // Handler for new accounts
      const handleAccounts = (
        extensionId: string,
        accounts: ExtensionAccount[],
        signer: unknown
      ) => {
        const result = processExtensionAccounts(
          {
            source: extensionId,
            network,
            ss58,
          },
          signer,
          accounts
        )
        return result
      }

      // Call optional `onExtensionEnabled` callback
      maybeOnExtensionEnabled(id)

      // If account subscriptions are not supported, simply get the account(s) from the extension. Otherwise, subscribe to accounts
      if (!extensionHasFeature(id, 'subscribeAccounts')) {
        const accounts = await extension.accounts.get()
        const result = handleAccounts(id, accounts, extension.signer)
        checkActiveAccount(result)
      } else {
        const unsub = extension.accounts.subscribe((accounts) => {
          const result = handleAccounts(id, accounts || [], extension.signer)
          checkActiveAccount(result)
        })
        addUnsub(id, unsub)
      }
      return true
    }
    return false
  }

  // Set active account if found in new accounts
  const checkActiveAccount = ({
    newAccounts,
    meta: { removedActiveAccount },
  }: ProcessExtensionAccountsResult) => {
    // Set active account for network if not yet set
    if (!activeAccount) {
      const activeExtensionAccount = getActiveExtensionAccount(
        network,
        ss58,
        newAccounts
      )
      if (
        activeExtensionAccount?.address !== removedActiveAccount &&
        removedActiveAccount !== null
      ) {
        connectActiveExtensionAccount(activeExtensionAccount, connectToAccount)
      }
    }
  }

  const handleSyncExtensionAccounts = async () => {
    // Wait for injectedWeb3 check to finish before starting account import process
    if (!gettingExtensions && extensionAccountsSynced === 'unsynced') {
      // Unsubscribe from all accounts and reset state
      unsubAll()
      resetAccounts()
      // If extensions have been fetched, get accounts if extensions exist and local extensions
      // exist (previously connected)
      if (Object.keys(extensionsStatus).length) {
        // get active extensions
        const localExtensions = localStorageOrDefault(
          `active_extensions`,
          [],
          true
        )
        if (Object.keys(extensionsStatus).length && localExtensions.length) {
          setExtensionAccountsSynced('syncing')
          await connectActiveExtensions()
        }
      }

      // Syncing is complete. Also covers case where no extensions were found
      setExtensionAccountsSynced('synced')
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

  // Re-sync extensions accounts on `unsynced`
  useEffect(() => {
    handleSyncExtensionAccounts()

    return () => unsubAll()
  }, [extensionsStatus, gettingExtensions, extensionAccountsSynced])

  // Once initialised extensions equal total extensions present in `injectedWeb3`, mark extensions
  // as fetched
  useEffectIgnoreInitial(() => {
    if (
      !gettingExtensions &&
      extensionsInitialised.length === Object.keys(extensionsStatus).length
    ) {
      setExtensionAccountsSynced('synced')
    }
  }, [gettingExtensions, extensionsInitialised])

  // Subscribes to observables and updates state
  useEffect(() => {
    const sub = combineLatest([initialisedExtensions$, accounts$]).subscribe(
      ([initialised, accounts]) => {
        setExtensionsInitialised(initialised)
        setExtensionAccounts(accounts)
      }
    )
    return () => {
      sub.unsubscribe()
    }
  }, [])

  return (
    <ExtensionAccountsContext.Provider
      value={{
        connectExtensionAccounts,
        extensionAccountsSynced,
        getExtensionAccounts,
      }}
    >
      {children}
    </ExtensionAccountsContext.Provider>
  )
}
