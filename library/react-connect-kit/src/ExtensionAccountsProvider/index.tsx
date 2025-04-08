/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { createSafeContext, useEffectIgnoreInitial } from '@w3ux/hooks'
import {
  getAccountsFromExtensions,
  handleExtensionAccountsUpdate,
} from '@w3ux/observables-connect/accounts'
import { connectExtensions } from '@w3ux/observables-connect/extensions'
import { initialisedExtensions$ } from '@w3ux/observables-connect/extensions/observables'
import type {
  ExtensionAccount,
  ImportedAccount,
  Sync,
  VoidFn,
} from '@w3ux/types'
import {
  formatAccountSs58,
  localStorageOrDefault,
  setStateWithRef,
} from '@w3ux/utils'
import { useEffect, useRef, useState } from 'react'
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
  const extensionAccountsRef = useRef(extensionAccounts)

  // Store whether extension accounts have been synced
  // TODO: Use observable to update this state
  const [extensionAccountsSynced, setExtensionAccountsSynced] =
    useState<Sync>('unsynced')

  // Stores initialised extensions
  const [extensionsInitialised, setExtensionsInitialised] = useState<string[]>(
    []
  )

  // Store unsubscribe handlers for connected extensions
  const unsubs = useRef<Record<string, VoidFn>>({})

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
    const { connected } = await connectExtensions(dappName)
    if (connected.size === 0) {
      return
    }

    // Initial fetch of extension accounts to populate accounts & extensions state
    // ----------------------------------------------------------------------------

    // Get full list of imported accounts.
    const initialAccounts = await getAccountsFromExtensions(connected)

    // Get the active account if found in initial accounts. Format initial account addresses to the
    // correct ss58 format before finding
    const activeAccountInInitial = initialAccounts
      .map((acc) => ({
        ...acc,
        address: formatAccountSs58(acc.address, ss58),
      }))
      .find(({ address }) => address === getActiveAccountLocal(network, ss58))

    // Perform initial account state update
    // ----------------------------------

    updateExtensionAccounts({ add: initialAccounts, remove: [] })

    // Initiate account subscriptions for connected extensions
    // --------------------------------------------------------

    // Handler function for each extension accounts subscription
    const handleAccounts = (
      extensionId: string,
      accounts: ExtensionAccount[],
      signer: unknown
    ) => {
      const {
        newAccounts,
        meta: { accountsToRemove },
      } = handleExtensionAccountsUpdate(
        extensionId,
        extensionAccountsRef.current,
        signer,
        accounts,
        network,
        ss58
      )

      // Update added and removed accounts
      updateExtensionAccounts({ add: newAccounts, remove: accountsToRemove })
    }

    // Try to subscribe to accounts for each connected extension
    for (const [id, { extension }] of Array.from(connected.entries())) {
      // If enabled, subscribe to accounts.
      if (extensionHasFeature(id, 'subscribeAccounts')) {
        const unsub = extension.accounts.subscribe((accounts) => {
          handleAccounts(id, accounts || [], extension.signer)
        })
        // Add unsub to context ref
        addToUnsubscribe(id, unsub)
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
      const handleAccounts = (accounts: ExtensionAccount[]) => {
        const {
          newAccounts,
          meta: { removedActiveAccount, accountsToRemove },
        } = handleExtensionAccountsUpdate(
          id,
          extensionAccountsRef.current,
          extension.signer,
          accounts,
          network,
          ss58
        )
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
            connectActiveExtensionAccount(
              activeExtensionAccount,
              connectToAccount
            )
          }
        }

        // Update extension accounts state
        updateExtensionAccounts({
          add: newAccounts,
          remove: accountsToRemove,
        })
      }

      // Call optional `onExtensionEnabled` callback
      maybeOnExtensionEnabled(id)

      // If account subscriptions are not supported, simply get the account(s) from the extension. Otherwise, subscribe to accounts
      if (!extensionHasFeature(id, 'subscribeAccounts')) {
        const accounts = await extension.accounts.get()
        handleAccounts(accounts)
      } else {
        const unsub = extension.accounts.subscribe((accounts) => {
          handleAccounts(accounts || [])
        })
        addToUnsubscribe(id, unsub)
      }
      return true
    }
    return false
  }

  // Add an extension account to context state
  const updateExtensionAccounts = ({
    add,
    remove,
  }: {
    add: ExtensionAccount[]
    remove: ExtensionAccount[]
  }) => {
    // Add new accounts and remove any removed accounts
    const newAccounts = [...extensionAccountsRef.current]
      .concat(add)
      .filter((a) => remove.find((s) => s.address === a.address) === undefined)

    if (remove.length) {
      // Unsubscribe from removed accounts
      unsubAccounts(remove)

      // Remove active account if it is being forgotten
      if (
        activeAccount &&
        remove.find(({ address }) => address === activeAccount) !== undefined
      ) {
        maybeSetActiveAccount(null)
      }
    }

    setStateWithRef(newAccounts, setExtensionAccounts, extensionAccountsRef)
  }

  // Add an extension id to unsubscribe state
  const addToUnsubscribe = (id: string, unsub: VoidFn) => {
    unsubs.current[id] = unsub
  }

  // Handle unsubscribing of an removed extension accounts
  const unsubAccounts = (accounts: ImportedAccount[]) => {
    // Unsubscribe and remove unsub from context ref
    if (accounts.length) {
      for (const { address } of accounts) {
        if (extensionAccountsRef.current.find((a) => a.address === address)) {
          const unsub = unsubs.current[address]
          if (unsub) {
            unsub()
            delete unsubs.current[address]
          }
        }
      }
    }
  }

  // Unsubscribe all account subscriptions
  const unsubscribe = () => {
    Object.values(unsubs.current).forEach((unsub) => {
      unsub()
    })
  }

  const handleSyncExtensionAccounts = async () => {
    // Wait for injectedWeb3 check to finish before starting account import process
    if (!gettingExtensions && extensionAccountsSynced === 'unsynced') {
      // Unsubscribe from all accounts and reset state
      unsubscribe()
      setStateWithRef([], setExtensionAccounts, extensionAccountsRef)
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

    return () => unsubscribe()
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
    const sub = initialisedExtensions$.subscribe((initialised) => {
      setExtensionsInitialised(initialised)
    })
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
