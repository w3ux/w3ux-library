/* @license Copyright 2024 @polkadot-cloud/library authors & contributors",
"SPDX-License-Identifier: GPL-3.0-only */

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { localStorageOrDefault, setStateWithRef } from "@w3ux/utils";
import { defaultExtensionAccountsContext } from "./defaults";
import { ImportedAccount, AnyFunction, Sync, VoidFn } from "../types";
import {
  ExtensionAccount,
  ExtensionInterface,
} from "../ExtensionsProvider/types";
import {
  ExtensionAccountsContextInterface,
  ExtensionAccountsProviderProps,
} from "./types";
import { useImportExtension } from "./useImportExtension";
import { initPolkadotSnap } from "./snap";
import { SnapNetworks } from "@chainsafe/metamask-polkadot-types";
import { Extensions } from "./Extensions";
import {
  connectActiveExtensionAccount,
  getActiveAccountLocal,
  getActiveExtensionAccount,
} from "./utils";
import { useExtensions } from "../ExtensionsProvider";
import { useEffectIgnoreInitial } from "@w3ux/hooks";

export const ExtensionAccountsContext =
  createContext<ExtensionAccountsContextInterface>(
    defaultExtensionAccountsContext
  );

export const useExtensionAccounts = () => useContext(ExtensionAccountsContext);

export const ExtensionAccountsProvider = ({
  children,
  network,
  ss58,
  dappName,
  activeAccount,
  setActiveAccount,
  onExtensionEnabled,
}: ExtensionAccountsProviderProps) => {
  const { handleImportExtension } = useImportExtension();

  const {
    extensionsStatus,
    setExtensionStatus,
    removeExtensionStatus,
    checkingInjectedWeb3,
    extensionHasFeature,
  } = useExtensions();

  // Store connected extension accounts.
  const [extensionAccounts, setExtensionAccounts] = useState<ImportedAccount[]>(
    []
  );
  const extensionAccountsRef = useRef(extensionAccounts);

  // Store whether extension accounts have been synced.
  const [extensionAccountsSynced, setExtensionAccountsSynced] =
    useState<Sync>("unsynced");

  // Store extensions whose account subscriptions have been initialised.
  const [extensionsInitialised, setExtensionsInitialised] = useState<string[]>(
    []
  );
  const extensionsInitialisedRef = useRef(extensionsInitialised);

  // Store unsubscribe handlers for connected extensions.
  const unsubs = useRef<Record<string, VoidFn>>({});

  // Helper for setting active account. Ignores if not a valid function.
  const maybeSetActiveAccount = (address: string) => {
    if (typeof setActiveAccount === "function") {
      setActiveAccount(address ?? null);
    }
  };

  // Helper for calling extension enabled callback. Ignores if not a valid function.
  const maybeOnExtensionEnabled = (id: string) => {
    if (typeof onExtensionEnabled === "function") {
      onExtensionEnabled(id);
    }
  };

  const connectToAccount = (account: ImportedAccount | null) => {
    maybeSetActiveAccount(account?.address ?? null);
  };

  // connectActiveExtensions
  //
  // Connects to extensions that already have been connected to and stored in localStorage. Loop
  // through extensions and connect to accounts. If `activeAccount` exists locally, we wait until
  // all extensions are looped before connecting to it; there is no guarantee it still exists - must
  // explicitly find it.
  const connectActiveExtensions = async () => {
    const extensionIds = Object.keys(extensionsStatus);
    if (!extensionIds.length) {
      return;
    }

    // Pre-connect: Inject extensions into `injectedWeb3` if not already injected.
    await handleExtensionAdapters(extensionIds);

    // Iterate previously connected extensions and retreive valid `enable` functions.
    // ------------------------------------------------------------------------------
    const rawExtensions = Extensions.getFromIds(extensionIds);

    // Attempt to connect to extensions via `enable` and format the results.
    const enableResults = Extensions.formatEnabled(
      rawExtensions,
      await Extensions.enable(rawExtensions, dappName)
    );

    // Retrieve the resulting connected extensions only.
    const connectedExtensions = Extensions.connected(enableResults);

    // Retrieve  extensions that failed to connect.
    const extensionsWithError = Extensions.withError(enableResults);

    // Add connected extensions to local storage.
    Array.from(connectedExtensions.keys()).forEach((id) =>
      Extensions.addToLocal(id)
    );

    // Initial fetch of extension accounts to populate accounts & extensions state.
    // ----------------------------------------------------------------------------

    // Get full list of imported accounts.
    const initialAccounts = await Extensions.getAllAccounts(
      connectedExtensions,
      ss58
    );

    // Connect to the active account if found in initial accounts.
    const activeAccountInInitial = initialAccounts.find(
      ({ address }) => address === getActiveAccountLocal(network, ss58)
    );

    // Perform all initial state updates.
    // ----------------------------------

    Array.from(extensionsWithError.entries()).forEach(([id, state]) => {
      handleExtensionError(id, state.error);
    });

    Array.from(connectedExtensions.keys()).forEach((id) => {
      setExtensionStatus(id, "connected");
      updateInitialisedExtensions(id);
    });

    updateExtensionAccounts({ add: initialAccounts, remove: [] });

    if (activeAccountInInitial) {
      connectActiveExtensionAccount(activeAccountInInitial, connectToAccount);
    }

    // Initiate account subscriptions for connected extensions.
    // --------------------------------------------------------

    // Handler function for each extension accounts subscription.
    const handleAccounts = (
      extensionId: string,
      accounts: ExtensionAccount[],
      signer: AnyFunction
    ) => {
      const {
        newAccounts,
        meta: { accountsToRemove },
      } = handleImportExtension(
        extensionId,
        extensionAccountsRef.current,
        signer,
        accounts,
        {
          network,
          ss58,
        }
      );

      // Update added and removed accounts.
      updateExtensionAccounts({ add: newAccounts, remove: accountsToRemove });
    };

    // Try to subscribe to accounts for each connected extension.
    for (const [id, { extension }] of Array.from(
      connectedExtensions.entries()
    )) {
      // If enabled, subscribe to accounts.
      if (extensionHasFeature(id, "subscribeAccounts")) {
        const unsub = extension.accounts.subscribe((accounts) => {
          handleAccounts(id, accounts || [], extension.signer);
        });

        // Add unsub to context ref.
        addToUnsubscribe(id, unsub);
      }
    }
  };

  // connectExtensionAccounts
  //
  // Similar to the above but only connects to a single extension. This is invoked by the user by
  // clicking on an extension. If activeAccount is not found here, it is simply ignored.
  const connectExtensionAccounts = async (id: string): Promise<boolean> => {
    const extensionIds = Object.keys(extensionsStatus);
    const exists = extensionIds.find((key) => key === id) || undefined;

    if (!exists) {
      updateInitialisedExtensions(
        `unknown_extension_${extensionsInitialisedRef.current.length + 1}`
      );
    } else {
      // Pre-connect: Inject into `injectedWeb3` if the provided extension is not already injected.
      await handleExtensionAdapters([id]);

      try {
        // Attempt to get extension `enable` property.
        const { enable } = window.injectedWeb3[id];

        // Summons extension popup.
        const extension: ExtensionInterface = await enable(dappName);

        // Continue if `enable` succeeded, and if the current network is supported.
        if (extension !== undefined) {
          // Handler for new accounts.
          const handleAccounts = (accounts: ExtensionAccount[]) => {
            const {
              newAccounts,
              meta: { removedActiveAccount, accountsToRemove },
            } = handleImportExtension(
              id,
              extensionAccountsRef.current,
              extension.signer,
              accounts,
              { network, ss58 }
            );
            // Set active account for network if not yet set.
            if (!activeAccount) {
              const activeExtensionAccount = getActiveExtensionAccount(
                { network, ss58 },
                newAccounts
              );
              if (
                activeExtensionAccount?.address !== removedActiveAccount &&
                removedActiveAccount !== null
              ) {
                connectActiveExtensionAccount(
                  activeExtensionAccount,
                  connectToAccount
                );
              }
            }

            // Update extension accounts state.
            updateExtensionAccounts({
              add: newAccounts,
              remove: accountsToRemove,
            });

            // Update initialised extensions.
            updateInitialisedExtensions(id);
          };

          // Call optional `onExtensionEnabled` callback.
          Extensions.addToLocal(id);

          maybeOnExtensionEnabled(id);
          setExtensionStatus(id, "connected");

          // If account subscriptions are not supported, simply get the account(s) from the extension. Otherwise, subscribe to accounts.
          if (!extensionHasFeature(id, "subscribeAccounts")) {
            const accounts = await extension.accounts.get();
            handleAccounts(accounts);
          } else {
            const unsub = extension.accounts.subscribe((accounts) => {
              handleAccounts(accounts || []);
            });
            addToUnsubscribe(id, unsub);
          }
          return true;
        }
      } catch (err) {
        handleExtensionError(id, String(err));
      }
    }
    return false;
  };

  // Handle errors when communiating with extensions.
  const handleExtensionError = (id: string, err: string) => {
    // if not general error (maybe enabled but no accounts trust app).
    if (err.startsWith("Error")) {
      // remove extension from local `active_extensions`.
      Extensions.removeFromLocal(id);

      // extension not found (does not exist).
      if (err.substring(0, 17) === "NotInstalledError") {
        removeExtensionStatus(id);
      } else {
        // declare extension as no imported accounts authenticated.
        setExtensionStatus(id, "not_authenticated");
      }
    }
    // mark extension as initialised.
    updateInitialisedExtensions(id);
  };

  // Handle adaptors for extensions that are not supported by `injectedWeb3`.
  const handleExtensionAdapters = async (extensionIds: string[]) => {
    // Connect to Metamask Polkadot Snap and inject into `injectedWeb3` if avaialble.
    if (extensionIds.find((id) => id === "metamask-polkadot-snap")) {
      await initPolkadotSnap({
        networkName: network as SnapNetworks,
        addressPrefix: ss58,
      });
    }
  };

  // Update initialised extensions.
  const updateInitialisedExtensions = (id: string) => {
    if (!extensionsInitialisedRef.current.includes(id)) {
      setStateWithRef(
        [...extensionsInitialisedRef.current].concat(id),
        setExtensionsInitialised,
        extensionsInitialisedRef
      );
    }
  };

  // Add an extension account to context state.
  const updateExtensionAccounts = ({
    add,
    remove,
  }: {
    add: ExtensionAccount[];
    remove: ExtensionAccount[];
  }) => {
    // Add new accounts and remove any removed accounts.
    const newAccounts = [...extensionAccountsRef.current]
      .concat(add)
      .filter((a) => remove.find((s) => s.address === a.address) === undefined);

    if (remove.length) {
      // Unsubscribe from removed accounts.
      unsubAccounts(remove);

      // Remove active account if it is being forgotten.
      if (
        activeAccount &&
        remove.find(({ address }) => address === activeAccount) !== undefined
      ) {
        maybeSetActiveAccount(null);
      }
    }

    setStateWithRef(newAccounts, setExtensionAccounts, extensionAccountsRef);
  };

  // Add an extension id to unsubscribe state.
  const addToUnsubscribe = (id: string, unsub: VoidFn) => {
    unsubs.current[id] = unsub;
  };

  // Handle unsubscribing of an removed extension accounts.
  const unsubAccounts = (accounts: ImportedAccount[]) => {
    // Unsubscribe and remove unsub from context ref.
    if (accounts.length) {
      for (const { address } of accounts) {
        if (extensionAccountsRef.current.find((a) => a.address === address)) {
          const unsub = unsubs.current[address];
          if (unsub) {
            unsub();
            delete unsubs.current[address];
          }
        }
      }
    }
  };

  // Unsubscrbe all account subscriptions.
  const unsubscribe = () => {
    Object.values(unsubs.current).forEach((unsub) => {
      unsub();
    });
  };

  const handleSyncExtensionAccounts = async () => {
    // Wait for injectedWeb3 check to finish before starting account import process.
    if (!checkingInjectedWeb3 && extensionAccountsSynced === "unsynced") {
      // Unsubscribe from all accounts and reset state
      unsubscribe();
      setStateWithRef([], setExtensionAccounts, extensionAccountsRef);
      setStateWithRef([], setExtensionsInitialised, extensionsInitialisedRef);
      // If extensions have been fetched, get accounts if extensions exist and local extensions
      // exist (previously connected).
      if (Object.keys(extensionsStatus).length) {
        // get active extensions
        const localExtensions = localStorageOrDefault(
          `active_extensions`,
          [],
          true
        );
        if (Object.keys(extensionsStatus).length && localExtensions.length) {
          setExtensionAccountsSynced("syncing");
          await connectActiveExtensions();
        }
      }

      // Syncing is complete. Also covers case where no extensions were found.
      setExtensionAccountsSynced("synced");
    }
  };

  // Re-sync extensions accounts on `unsynced`.
  useEffect(() => {
    handleSyncExtensionAccounts();

    return () => unsubscribe();
  }, [extensionsStatus, checkingInjectedWeb3, extensionAccountsSynced]);

  // Change syncing to unsynced on `ss58` change.
  useEffectIgnoreInitial(() => {
    setExtensionAccountsSynced("unsynced");
  }, [ss58]);

  // Once initialised extensions equal total extensions present in `injectedWeb3`, mark extensions
  // as fetched.
  useEffectIgnoreInitial(() => {
    if (
      !checkingInjectedWeb3 &&
      extensionsInitialised.length === Object.keys(extensionsStatus).length
    ) {
      setExtensionAccountsSynced("synced");
    }
  }, [checkingInjectedWeb3, extensionsInitialised]);

  return (
    <ExtensionAccountsContext.Provider
      value={{
        connectExtensionAccounts,
        extensionAccountsSynced,
        extensionAccounts: extensionAccountsRef.current,
      }}
    >
      {children}
    </ExtensionAccountsContext.Provider>
  );
};
