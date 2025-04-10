/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { HardwareAccount } from '@w3ux/types'
import { localStorageOrDefault } from '@w3ux/utils'

// Gets imported Ledger accounts from local storage
export const getLocalLedgerAccounts = (network?: string): HardwareAccount[] => {
  const localAddresses = localStorageOrDefault(
    'ledger_accounts',
    [],
    true
  ) as HardwareAccount[]

  return network
    ? localAddresses.filter((a) => a.network === network)
    : localAddresses
}
