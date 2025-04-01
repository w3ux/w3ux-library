/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */
/* eslint-disable @typescript-eslint/no-unused-vars */

import type { LedgerAccountsContextInterface } from './types'

export const defaultLedgerAccountsContext: LedgerAccountsContextInterface = {
  ledgerAccountExists: (network, address) => false,
  addLedgerAccount: (network, address, index, callback) => null,
  removeLedgerAccount: (network, address, callback) => {},
  renameLedgerAccount: (network, address, newName) => {},
  getLedgerAccount: (network, address) => null,
  getLedgerAccounts: (network) => [],
  ledgerAccounts: [],
}
