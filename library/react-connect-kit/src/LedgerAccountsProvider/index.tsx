/* @license Copyright 2024 @polkadot-cloud/library authors & contributors",
"SPDX-License-Identifier: GPL-3.0-only */

import { createContext, useContext, useRef, useState } from "react";
import { defaultLedgerAccountsContext } from "./defaults";
import {
  LedgerAccountsContextInterface,
  LedgerAccountsProviderProps,
} from "./types";
import { LedgerAccount } from "../types";
import {
  getLocalLedgerAccounts,
  getLocalLedgerAddresses,
  isLocalLedgerAccount,
  renameLocalLedgerAddress,
} from "./utils";
import { setStateWithRef } from "@w3ux/utils";
import { useEffectIgnoreInitial } from "@w3ux/hooks";

export const LedgerAccountsContext =
  createContext<LedgerAccountsContextInterface>(defaultLedgerAccountsContext);

export const useLedgerAccounts = () => useContext(LedgerAccountsContext);

export const LedgerAccountsProvider = ({
  children,
  network,
}: LedgerAccountsProviderProps) => {
  // Store the fetched ledger accounts.
  const [ledgerAccounts, setLedgerAccountsState] = useState<LedgerAccount[]>(
    getLocalLedgerAccounts(network)
  );
  const ledgerAccountsRef = useRef(ledgerAccounts);

  // Check if a Ledger address exists in imported addresses.
  const ledgerAccountExists = (address: string) =>
    !!getLocalLedgerAccounts().find((account) =>
      isLocalLedgerAccount(network, account, address)
    );

  // Adds a ledger address to the list of fetched addresses.
  const addLedgerAccount = (
    address: string,
    index: number,
    callback?: () => void
  ) => {
    let newLedgerAccounts = getLocalLedgerAccounts();

    const ledgerAddress = getLocalLedgerAddresses().find((a) =>
      isLocalLedgerAccount(network, a, address)
    );

    if (
      ledgerAddress &&
      !newLedgerAccounts.find((account) =>
        isLocalLedgerAccount(network, account, address)
      )
    ) {
      const newAccount = {
        address,
        network,
        name: ledgerAddress.name,
        source: "ledger",
        index,
      };

      // Update the full list of local ledger accounts with new entry.
      newLedgerAccounts = [...newLedgerAccounts].concat(newAccount);
      localStorage.setItem(
        "ledger_accounts",
        JSON.stringify(newLedgerAccounts)
      );

      // Store only those accounts on the current network in state.
      setStateWithRef(
        newLedgerAccounts.filter((account) => account.network === network),
        setLedgerAccountsState,
        ledgerAccountsRef
      );

      // Handle optional callback function.
      if (typeof callback === "function") {
        callback();
      }
      return newAccount;
    }
    return null;
  };

  // Removes a Ledger account from state and local storage.
  const removeLedgerAccount = (address: string, callback?: () => void) => {
    // Remove th account from local storage records
    const newLedgerAccounts = getLocalLedgerAccounts().filter((account) => {
      if (account.address !== address) {
        return true;
      }
      if (account.network !== network) {
        return true;
      }
      return false;
    });
    if (!newLedgerAccounts.length) {
      localStorage.removeItem("ledger_accounts");
    } else {
      localStorage.setItem(
        "ledger_accounts",
        JSON.stringify(newLedgerAccounts)
      );
    }

    // Update state with the new list of accounts.
    setStateWithRef(
      newLedgerAccounts.filter((account) => account.network === network),
      setLedgerAccountsState,
      ledgerAccountsRef
    );

    // Handle optional callback function.
    if (typeof callback === "function") {
      callback();
    }
  };

  // Renames an imported ledger account.
  const renameLedgerAccount = (address: string, newName: string) => {
    // Update the local storage records.
    const newLedgerAccounts = getLocalLedgerAccounts().map((account) =>
      isLocalLedgerAccount(network, account, address)
        ? {
            ...account,
            name: newName,
          }
        : account
    );
    renameLocalLedgerAddress(address, newName, network);
    localStorage.setItem("ledger_accounts", JSON.stringify(newLedgerAccounts));

    // Update state with the new list of accounts.
    setStateWithRef(
      newLedgerAccounts.filter((account) => account.network === network),
      setLedgerAccountsState,
      ledgerAccountsRef
    );
  };

  // Gets an imported address along with its Ledger metadata.
  const getLedgerAccount = (address: string) => {
    const localLedgerAccounts = getLocalLedgerAccounts();
    if (!localLedgerAccounts) {
      return null;
    }
    return (
      localLedgerAccounts.find((account) =>
        isLocalLedgerAccount(network, account, address)
      ) || null
    );
  };

  // Refresh imported ledger accounts on network change.
  useEffectIgnoreInitial(() => {
    setStateWithRef(
      getLocalLedgerAccounts(network),
      setLedgerAccountsState,
      ledgerAccountsRef
    );
  }, [network]);

  return (
    <LedgerAccountsContext.Provider
      value={{
        ledgerAccountExists,
        getLedgerAccount,
        addLedgerAccount,
        removeLedgerAccount,
        renameLedgerAccount,
        ledgerAccounts: ledgerAccountsRef.current,
      }}
    >
      {children}
    </LedgerAccountsContext.Provider>
  );
};
