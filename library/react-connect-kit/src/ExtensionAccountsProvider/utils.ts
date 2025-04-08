/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { ExtensionAccount, ImportedAccount } from '@w3ux/types'
import { formatAccountSs58, localStorageOrDefault } from '@w3ux/utils'

// Gets local `active_acount` for a network.
export const getActiveAccountLocal = (
  network: string,
  ss58: number
): string | null => {
  const account = localStorageOrDefault(`${network}_active_account`, null)

  if (account !== null) {
    const formattedAddress = formatAccountSs58(account, ss58)
    if (formattedAddress) {
      return formattedAddress
    }
  }
  return null
}

// Checks if the local active account is the provided accounts.
export const getActiveExtensionAccount = (
  network: string,
  ss58: number,
  accounts: ExtensionAccount[]
) =>
  accounts.find(
    ({ address }) => address === getActiveAccountLocal(network, ss58)
  ) ?? null

// Connects to active account, and calls an optional callback, if provided.
export const connectActiveExtensionAccount = (
  account: ExtensionAccount | null,
  callback: (account: ImportedAccount | null) => void
) => {
  if (account !== null) {
    callback(account)
  }
}
