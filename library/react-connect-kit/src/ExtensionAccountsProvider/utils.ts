/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { formatAccountSs58, localStorageOrDefault } from "@w3ux/utils";
import { ExtensionAccount } from "../ExtensionsProvider/types";
import { ExternalAccount } from "../types";
import { DEFAULT_SS58 } from "./defaults";
import { AnyFunction } from "@w3ux/types";

/*------------------------------------------------------------
   Active account utils.
 ------------------------------------------------------------*/

// Gets local `active_acount` for a network.
export const getActiveAccountLocal = (network: string): string | null => {
  const account = localStorageOrDefault(`${network}_active_account`, null);

  if (account !== null) {
    const formattedAddress = formatAccountSs58(account, DEFAULT_SS58);
    if (formattedAddress) {
      return formattedAddress;
    }
  }
  return null;
};

// Checks if the local active account is the provided accounts.
export const getActiveExtensionAccount = (
  network: string,
  accounts: ExtensionAccount[]
) =>
  accounts.find(({ address }) => address === getActiveAccountLocal(network)) ??
  null;

// Connects to active account, and calls an optional callback, if provided.
export const connectActiveExtensionAccount = (
  account: ExtensionAccount | null,
  callback: AnyFunction
) => {
  if (account !== null) {
    callback(account);
  }
};

/*------------------------------------------------------------
   External account utils.
 ------------------------------------------------------------*/

// Gets accounts that exist in local `external_accounts`.
export const getInExternalAccounts = (
  accounts: ExtensionAccount[],
  network: string
) => {
  const localExternalAccounts = getLocalExternalAccounts(network);

  return (
    localExternalAccounts.filter(
      (a) => (accounts || []).find((b) => b.address === a.address) !== undefined
    ) || []
  );
};

// Gets local external accounts for a network.
export const getLocalExternalAccounts = (network?: string) => {
  let localAccounts = localStorageOrDefault<ExternalAccount[]>(
    "external_accounts",
    [],
    true
  ) as ExternalAccount[];
  if (network) {
    localAccounts = localAccounts.filter((l) => l.network === network);
  }
  return localAccounts;
};
