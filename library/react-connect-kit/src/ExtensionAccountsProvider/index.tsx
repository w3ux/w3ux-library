/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { createSafeContext, useEffectIgnoreInitial } from '@w3ux/hooks'
import {
  connectedExtensions,
  enableExtensions,
  extensionsWithError,
  formatEnabledExtensions,
  getAccountsFromExtensions,
  getExtensionsById,
  handleExtensionAccountsUdpdate,
} from '@w3ux/observables-connect/accounts'
import {
  addExtensionToLocal,
  removeExtensionFromLocal,
} from '@w3ux/observables-connect/extensions/local'
import type {
  ExtensionAccount,
  ExtensionInterface,
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
    setExtensionStatus,
    removeExtensionStatus,
    checkingInjectedWeb3,
    extensionHasFeature,
  } = useExtensions()

  // Store connected extension accounts
  const [extensionAccounts, setExtensionAccounts] = useState<ImportedAccount[]>(
    []
  )
  const extensionAccountsRef = useRef(extensionAccounts)

  // Store whether extension accounts have been synced
  const [extensionAccountsSynced, setExtensionAccountsSynced] =
    useState<Sync>('unsynced')

  // Store extensions whose account subscriptions have been initialised
  const [extensionsInitialised, setExtensionsInitialised] = useState<string[]>(
    []
  )
  const extensionsInitialisedRef = useRef(extensionsInitialised)

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

  // connectActiveExtensions
  //
  // Connects to extensions that already have been connected to and stored in localStorage. Loop
  // through extensions and connect to accounts. If `activeAccount` exists locally, we wait until
  // all extensions are looped before connecting to it; there is no guarantee it still exists - must
  // explicitly find it
  const connectActiveExtensions = async () => {
    const extensionIds = Object.keys(extensionsStatus)
    if (!extensionIds.length) {
      return
    }

    // Iterate previously connected extensions and retreive valid `enable` functions
    // ------------------------------------------------------------------------------
    const rawExtensions = getExtensionsById(extensionIds)

    // Attempt to connect to extensions via `enable` and format the results
    const enableResults = formatEnabledExtensions(
      rawExtensions,
      await enableExtensions(rawExtensions, dappName)
    )

    // Retrieve the resulting connected extensions only
    const connected = connectedExtensions(enableResults)

    // Retrieve extensions that failed to connect
    const withError = extensionsWithError(enableResults)

    // Add connected extensions to local storage.
    Array.from(connected.keys()).forEach((id) => addExtensionToLocal(id))

    Array.from(withError.entries()).forEach(([id, state]) => {
      handleExtensionError(id, state.error)
    })

    Array.from(connected.keys()).forEach((id) => {
      setExtensionStatus(id, 'connected')
      updateInitialisedExtensions(id)
    })

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
      } = handleExtensionAccountsUdpdate(
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

  // connectExtensionAccounts
  //
  // Similar to the above but only connects to a single extension. This is invoked by the user by
  // clicking on an extension. If activeAccount is not found here, it is simply ignored
  const connectExtensionAccounts = async (id: string): Promise<boolean> => {
    const extensionIds = Object.keys(extensionsStatus)
    const exists = extensionIds.find((key) => key === id) || undefined

    if (!exists) {
      updateInitialisedExtensions(
        `unknown_extension_${extensionsInitialisedRef.current.length + 1}`
      )
    } else {
      try {
        // Attempt to get extension `enable` property
        const { enable } = window.injectedWeb3[id]

        // Summons extension popup.
        const extension: ExtensionInterface = await enable(dappName)

        // Continue if `enable` succeeded, and if the current network is supported
        if (extension !== undefined) {
          // Handler for new accounts
          const handleAccounts = (accounts: ExtensionAccount[]) => {
            const {
              newAccounts,
              meta: { removedActiveAccount, accountsToRemove },
            } = handleExtensionAccountsUdpdate(
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

            // Update initialised extensions
            updateInitialisedExtensions(id)
          }

          // Call optional `onExtensionEnabled` callback
          addExtensionToLocal(id)

          maybeOnExtensionEnabled(id)
          setExtensionStatus(id, 'connected')

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
      } catch (err) {
        handleExtensionError(id, String(err))
      }
    }
    return false
  }

  // Handle errors when communicating with extensions
  const handleExtensionError = (id: string, err: string) => {
    // if not general error (maybe enabled but no accounts trust app)
    if (err.startsWith('Error')) {
      // remove extension from local `active_extensions`
      removeExtensionFromLocal(id)

      // extension not found (does not exist).
      if (err.substring(0, 17) === 'NotInstalledError') {
        removeExtensionStatus(id)
      } else {
        // declare extension as no imported accounts authenticated
        setExtensionStatus(id, 'not_authenticated')
      }
    }
    // mark extension as initialised
    updateInitialisedExtensions(id)
  }

  // Update initialised extensions
  const updateInitialisedExtensions = (id: string) => {
    if (!extensionsInitialisedRef.current.includes(id)) {
      setStateWithRef(
        [...extensionsInitialisedRef.current].concat(id),
        setExtensionsInitialised,
        extensionsInitialisedRef
      )
    }
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
    if (!checkingInjectedWeb3 && extensionAccountsSynced === 'unsynced') {
      // Unsubscribe from all accounts and reset state
      unsubscribe()
      setStateWithRef([], setExtensionAccounts, extensionAccountsRef)
      setStateWithRef([], setExtensionsInitialised, extensionsInitialisedRef)
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
  }, [extensionsStatus, checkingInjectedWeb3, extensionAccountsSynced])

  // Once initialised extensions equal total extensions present in `injectedWeb3`, mark extensions
  // as fetched
  useEffectIgnoreInitial(() => {
    if (
      !checkingInjectedWeb3 &&
      extensionsInitialised.length === Object.keys(extensionsStatus).length
    ) {
      setExtensionAccountsSynced('synced')
    }
  }, [checkingInjectedWeb3, extensionsInitialised])

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
