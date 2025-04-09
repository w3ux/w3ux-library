/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { ExternalAccount } from '@w3ux/types'
import { localStorageOrDefault } from '@w3ux/utils'

// Gets local external accounts for a network
export const getLocalExternalAccounts = (network?: string) => {
  let localAccounts = localStorageOrDefault<ExternalAccount[]>(
    'external_accounts',
    [],
    true
  ) as ExternalAccount[]
  if (network) {
    localAccounts = localAccounts.filter((l) => l.network === network)
  }
  return localAccounts
}
