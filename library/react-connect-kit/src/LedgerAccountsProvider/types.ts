/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { ReactNode } from "react";
import { LedgerAccount } from "../types";

export interface LedgerAccountsContextInterface {
  ledgerAccountExists: (a: string) => boolean;
  addLedgerAccount: (
    address: string,
    index: number,
    callback?: () => void
  ) => LedgerAccount | null;
  removeLedgerAccount: (address: string, callback?: () => void) => void;
  renameLedgerAccount: (address: string, name: string) => void;
  getLedgerAccount: (address: string) => LedgerAccount | null;
  ledgerAccounts: LedgerAccount[];
}

export interface LedgerAccountsProviderProps {
  children: ReactNode;
  network: string;
}

export interface LedgerAddress {
  address: string;
  index: number;
  name: string;
  network: string;
  pubKey: string;
}
