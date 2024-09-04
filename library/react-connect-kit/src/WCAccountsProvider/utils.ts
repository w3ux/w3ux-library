/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { localStorageOrDefault } from "@w3ux/utils";
import { WCAccount } from "../types";

// Gets imported Wallet Connect accounts from local storage.
export const getLocalWcAccounts = (network?: string) => {
  const localAddresses = localStorageOrDefault(
    "wallet_connect_accounts",
    [],
    true
  ) as WCAccount[];

  return network
    ? localAddresses.filter((a) => a.network === network)
    : localAddresses;
};

// Gets whether an address is a local network address.
export const isLocalNetworkAddress = (
  chain: string,
  a: { address: string | undefined; network: string },
  address: string
) => a.address === address && a.network === chain;
