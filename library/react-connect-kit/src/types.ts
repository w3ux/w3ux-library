/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import {
  ExtensionInjected,
  ExtensionInterface,
} from "./ExtensionsProvider/types";

declare global {
  interface Window {
    injectedWeb3?: Record<string, ExtensionInjected>;
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
