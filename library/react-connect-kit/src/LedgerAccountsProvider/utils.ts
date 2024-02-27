/* @license Copyright 2024 @polkadot-cloud/library authors & contributors",
"SPDX-License-Identifier: GPL-3.0-only */

import { localStorageOrDefault } from "@w3ux/utils";
import { LedgerAccount } from "../types";
import { LedgerAddress } from "./types";

// Gets imported Ledger accounts from local storage.
export const getLocalLedgerAccounts = (network?: string): LedgerAccount[] => {
  const localAddresses = localStorageOrDefault(
    "ledger_accounts",
    [],
    true
  ) as LedgerAccount[];

  return network
    ? localAddresses.filter((a) => a.network === network)
    : localAddresses;
};

// Gets whether an address is a local Ledger account.
export const isLocalLedgerAccount = (
  network: string,
  account: { address: string | null; network: string },
  address: string
) => account.address === address && account.network === network;

// Gets saved ledger addresses from local storage.
export const getLocalLedgerAddresses = (network?: string) => {
  const localAddresses = localStorageOrDefault(
    "ledger_addresses",
    [],
    true
  ) as LedgerAddress[];

  return network
    ? localAddresses.filter((a) => a.network === network)
    : localAddresses;
};

// Renames a record from local ledger addresses.
export const renameLocalLedgerAddress = (
  address: string,
  name: string,
  network: string
) => {
  const localLedger = (
    localStorageOrDefault("ledger_addresses", [], true) as LedgerAddress[]
  )?.map((i) =>
    !(i.address === address && i.network === network)
      ? i
      : {
          ...i,
          name,
        }
  );
  if (localLedger) {
    localStorage.setItem("ledger_addresses", JSON.stringify(localLedger));
  }
};
