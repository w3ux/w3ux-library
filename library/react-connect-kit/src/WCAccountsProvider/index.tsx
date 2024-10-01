/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { ellipsisFn, setStateWithRef } from "@w3ux/utils";
import { createContext, useContext, useRef, useState } from "react";
import { getLocalWcAccounts, isLocalNetworkAddress } from "./utils";
import type {
  WCAccountsContextInterface,
  WCAccountsProviderProps,
} from "./types";
import { defaultWcAccountsContext } from "./defaults";
import { WCAccount } from "../types";

export const WCAccountsContext = createContext<WCAccountsContextInterface>(
  defaultWcAccountsContext
);

export const useWcAccounts = () => useContext(WCAccountsContext);

export const WCAccountsProvider = ({ children }: WCAccountsProviderProps) => {
  const [wcAccounts, setWcAccountsState] =
    useState<WCAccount[]>(getLocalWcAccounts());
  const wcAccountsRef = useRef(wcAccounts);

  // Check if a Wallet Connect address exists in imported addresses.
  const wcAccountExists = (network: string, address: string) =>
    !!wcAccountsRef.current.find((a) =>
      isLocalNetworkAddress(network, a, address)
    );

  // Adds a wallet connect account to state and local storage.
  const addWcAccount = (
    network: string,
    address: string,
    index: number,
    callback?: () => void
  ) => {
    let newAccounts = [...wcAccountsRef.current];

    if (!newAccounts.find((a) => isLocalNetworkAddress(network, a, address))) {
      const account = {
        address,
        network,
        name: ellipsisFn(address),
        source: "wallet_connect",
        index,
      };

      newAccounts = [...newAccounts].concat(account);
      localStorage.setItem(
        "wallet_connect_accounts",
        JSON.stringify(newAccounts)
      );

      // Persist the new accounts to state.
      setStateWithRef(newAccounts, setWcAccountsState, wcAccountsRef);

      // Handle optional callback function.
      if (typeof callback === "function") {
        callback();
      }

      return account;
    }
    return null;
  };

  const removeWcAccount = (
    network: string,
    address: string,
    callback?: () => void
  ) => {
    let newAccounts = [...wcAccountsRef.current];

    newAccounts = newAccounts.filter((a) => {
      if (a.address !== address) {
        return true;
      }
      if (a.network !== network) {
        return true;
      }
      return false;
    });

    if (!newAccounts.length) {
      localStorage.removeItem("wallet_connect_accounts");
    } else {
      localStorage.setItem(
        "wallet_connect_accounts",
        JSON.stringify(newAccounts)
      );
    }
    setStateWithRef(newAccounts, setWcAccountsState, wcAccountsRef);

    // Handle optional callback function.
    if (typeof callback === "function") {
      callback();
    }
  };

  const getWcAccount = (network: string, address: string) =>
    wcAccountsRef.current.find((a) =>
      isLocalNetworkAddress(network, a, address)
    ) ?? null;

  const renameWcAccount = (
    network: string,
    address: string,
    newName: string
  ) => {
    const newAccounts = wcAccountsRef.current.map((a) =>
      isLocalNetworkAddress(network, a, address)
        ? {
            ...a,
            name: newName,
          }
        : a
    );
    localStorage.setItem(
      "wallet_connect_accounts",
      JSON.stringify(newAccounts)
    );

    setStateWithRef(newAccounts, setWcAccountsState, wcAccountsRef);
  };

  // Gets Wallet Connect accounts for a network.
  const getWcAccounts = (network: string) =>
    wcAccountsRef.current.filter((a) => a.network === network);

  return (
    <WCAccountsContext.Provider
      value={{
        wcAccountExists,
        addWcAccount,
        removeWcAccount,
        renameWcAccount,
        getWcAccount,
        getWcAccounts,
        wcAccounts: wcAccountsRef.current,
      }}
    >
      {children}
    </WCAccountsContext.Provider>
  );
};
