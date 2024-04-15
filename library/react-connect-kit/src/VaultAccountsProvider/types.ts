/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { ReactNode } from "react";
import { VaultAccount } from "../types";

export interface VaultAccountsProviderProps {
  children: ReactNode;
  network: string;
}

export interface VaultAccountsContextInterface {
  vaultAccountExists: (address: string) => boolean;
  addVaultAccount: (
    address: string,
    index: number,
    callback?: () => void
  ) => VaultAccount | null;
  removeVaultAccount: (address: string, callback?: () => void) => void;
  renameVaultAccount: (address: string, newName: string) => void;
  getVaultAccount: (address: string) => VaultAccount | null;
  getVaultAccounts: (network: string) => VaultAccount[];
  vaultAccounts: VaultAccount[];
}
