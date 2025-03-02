/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { AnyJson } from "./common";

export type AccountSource = "extension" | "external" | "ledger" | "vault";

export type ExternalAccountAddedBy = "system" | "user";

export type ExtensionStatus = "installed" | "not_authenticated" | "connected";

// Miscellaneous metadata added to an extension.
export interface ExtensionMetadata {
  addedBy?: ExternalAccountAddedBy;
  source: string;
}

// General account type that can be imported.
export type ImportedAccount =
  | ExtensionAccount
  | ExternalAccount
  | LedgerAccount
  | VaultAccount
  | WCAccount;

export interface ExtensionAccount extends ExtensionMetadata {
  address: string;
  meta?: AnyJson;
  name: string;
  signer?: AnyJson;
}

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
