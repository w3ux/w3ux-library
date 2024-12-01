/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { ReactNode } from "react";
import { ExtensionAccount } from "../ExtensionsProvider/types";
import { ImportedAccount, MaybeAddress } from "../types";
import { Sync } from "@w3ux/types";

export interface ExtensionAccountsContextInterface {
  connectExtensionAccounts: (id?: string) => Promise<boolean>;
  extensionAccountsSynced: Sync;
  getExtensionAccounts: (ss58: number) => ImportedAccount[];
}

export interface ExtensionAccountsProviderProps {
  children: ReactNode;
  network: string;
  ss58: number;
  dappName: string;
  activeAccount?: MaybeAddress;
  setActiveAccount?: (address: MaybeAddress) => void;
  onExtensionEnabled?: (id: string) => void;
}

export interface HandleImportExtension {
  newAccounts: ExtensionAccount[];
  meta: {
    accountsToRemove: ExtensionAccount[];
    removedActiveAccount: MaybeAddress;
  };
}

export type HexString = `0x${string}`;
