/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { HardwareAccount } from '@w3ux/types'
import { localStorageOrDefault } from '@w3ux/utils'
import { hardwareAccountsKey } from '../consts'

// Gets imported Ledger accounts from local storage
export const getLocalHardwareAccounts = (): HardwareAccount[] => {
  const accounts = localStorageOrDefault(
    hardwareAccountsKey,
    [],
    true
  ) as HardwareAccount[]

  return accounts
}
