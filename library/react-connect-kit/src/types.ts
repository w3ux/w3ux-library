/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import {
  ExtensionAccount,
  ExtensionInterface,
} from "./ExtensionsProvider/types";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    injectedWeb3?: Record<string, { enable: (id: string) => any }>;
  }
}

/*------------------------------------------------------------
   Re-export package inner types.
 ------------------------------------------------------------*/

export * from "./ExtensionsProvider/types";
export * from "./ExtensionAccountsProvider/types";
export * from "./LedgerAccountsProvider/types";
export * from "./VaultAccountsProvider/types";

/*------------------------------------------------------------
   Imported account types.
 ------------------------------------------------------------*/
export type MaybeAddress = string | null;

export type AccountSource = "extension" | "external" | "ledger" | "vault";

export type ExternalAccountAddedBy = "system" | "user";

export type ImportedAccount =
  | ExtensionAccount
  | ExternalAccount
  | LedgerAccount
  | VaultAccount
  | WCAccount;

export interface ExternalAccount {
  address: string;
  network: string;
  name: string;
  source: string;
  addedBy: ExternalAccountAddedBy;
}

export interface LedgerAccount {
  address: string;
  network: string;
  name: string;
  source: string;
  index: number;
}

export interface VaultAccount {
  address: string;
  network: string;
  name: string;
  source: string;
  index: number;
}

export interface WCAccount {
  address: string;
  network: string;
  name: string;
  source: string;
  index: number;
}

/*------------------------------------------------------------
   Extension import process types.
 ------------------------------------------------------------*/

export type RawExtensions = Map<string, RawExtensionEnable>;

export type RawExtensionEnable = (name?: string) => Promise<ExtensionInterface>;

export type ExtensionEnableStatus =
  | "valid"
  | "extension_not_found"
  | "enable_invalid";

export type ExtensionEnableResults = Map<string, ExtensionEnableResult>;

export interface ExtensionEnableResult {
  extension?: ExtensionInterface;
  connected: boolean;
  error?: string;
}
