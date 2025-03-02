/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { ReactNode } from "react";
import {
  Sync,
  MaybeString,
  ImportedAccount,
  ExtensionAccount,
} from "@w3ux/types";

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
  activeAccount?: MaybeString;
  setActiveAccount?: (address: MaybeString) => void;
  onExtensionEnabled?: (id: string) => void;
}

export interface HandleImportExtension {
  newAccounts: ExtensionAccount[];
  meta: {
    accountsToRemove: ExtensionAccount[];
    removedActiveAccount: MaybeString;
  };
}
