/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function,  no-unused-vars */

import type { VaultAccountsContextInterface } from "./types";

export const defaultVaultAccountsContext: VaultAccountsContextInterface = {
  vaultAccountExists: (network, address) => false,
  addVaultAccount: (network, address, index, callback) => null,
  removeVaultAccount: (network, address, callback) => {},
  renameVaultAccount: (network, address, newName) => {},
  getVaultAccount: (network, address) => null,
  getVaultAccounts: (network) => [],
  vaultAccounts: [],
};
