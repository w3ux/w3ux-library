/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { createContext, useContext, useRef, useState } from "react";
import { defaultLedgerAccountsContext } from "./defaults";
import {
  LedgerAccountsContextInterface,
  LedgerAccountsProviderProps,
} from "./types";
import {
  getLocalLedgerAccounts,
  getLocalLedgerAddresses,
  isLocalLedgerAccount,
  renameLocalLedgerAddress,
} from "./utils";
import { setStateWithRef } from "@w3ux/utils";
import { LedgerAccount } from "@w3ux/types";

export const LedgerAccountsContext =
  createContext<LedgerAccountsContextInterface>(defaultLedgerAccountsContext);

export const useLedgerAccounts = () => useContext(LedgerAccountsContext);

export const LedgerAccountsProvider = ({
  children,
}: LedgerAccountsProviderProps) => {
  // Store the fetched ledger accounts.
  const [ledgerAccounts, setLedgerAccountsState] = useState<LedgerAccount[]>(
    getLocalLedgerAccounts()
  );
  const ledgerAccountsRef = useRef(ledgerAccounts);

  // Check if a Ledger address exists in imported addresses.
  const ledgerAccountExists = (network: string, address: string) =>
    !!getLocalLedgerAccounts().find((account) =>
      isLocalLedgerAccount(network, account, address)
    );

  // Adds a ledger address to the list of fetched addresses.
  const addLedgerAccount = (
    network: string,
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
  const removeLedgerAccount = (
    network: string,
    address: string,
    callback?: () => void
  ) => {
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
  const renameLedgerAccount = (
    network: string,
    address: string,
    newName: string
  ) => {
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
  const getLedgerAccount = (network: string, address: string) => {
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

  // Gets Ledger accounts for a network.
  const getLedgerAccounts = (network: string) =>
    ledgerAccountsRef.current.filter((a) => a.network === network);

  return (
    <LedgerAccountsContext.Provider
      value={{
        ledgerAccountExists,
        getLedgerAccount,
        addLedgerAccount,
        removeLedgerAccount,
        renameLedgerAccount,
        getLedgerAccounts,
        ledgerAccounts: ledgerAccountsRef.current,
      }}
    >
      {children}
    </LedgerAccountsContext.Provider>
  );
};
