/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function,  no-unused-vars */

import type { WCAccountsContextInterface } from "./types";

export const defaultWcAccountsContext: WCAccountsContextInterface = {
  wcAccountExists: (network, address) => false,
  addWcAccount: (network, address, index, callback) => null,
  removeWcAccount: (network, address, callback) => {},
  renameWcAccount: (network, address, newName) => {},
  getWcAccount: (network, address) => null,
  getWcAccounts: (network) => [],
  wcAccounts: [],
};
