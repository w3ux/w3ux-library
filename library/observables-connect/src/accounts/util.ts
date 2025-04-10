/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type {
  ExtensionAccount,
  ProcessExtensionAccountsResult,
} from '@w3ux/types'
import { formatAccountSs58, isValidAddress } from '@w3ux/utils'
import { defaultProcessExtensionResult } from '../consts'
import { _extensionAccounts } from '../observables'

// Gets accounts to be imported and commits them to state

interface Config {
  source: string
  ss58: number
}
export const processExtensionAccounts = (
  config: Config,
  signer: unknown,
  newAccounts: ExtensionAccount[]
): ProcessExtensionAccountsResult => {
  const { source, ss58 } = config
  if (!newAccounts.length) {
    return defaultProcessExtensionResult
  }

  // Get valid accounts from extension
  newAccounts = formatExtensionAccounts(newAccounts, ss58)

  // Find any accounts that have been removed from this extension
  const removedAccounts = _extensionAccounts
    .getValue()
    .filter((j) => j.source === source)
    .filter((j) => !newAccounts.find((i) => i.address === j.address))

  // Remove accounts that have already been imported
  newAccounts = newAccounts.filter(
    ({ address }) =>
      !_extensionAccounts
        .getValue()
        .find((j) => j.address === address && j.source !== 'external')
  )

  // Format accounts properties
  newAccounts = newAccounts.map(({ address, name }) => ({
    address,
    name,
    source,
    signer,
  }))

  // Update observable state
  updateAccounts({
    add: newAccounts,
    remove: removedAccounts,
  })

  return {
    newAccounts,
    removedAccounts: [...removedAccounts],
  }
}

// Formats accounts to correct ss58 and removes invalid accounts
export const formatExtensionAccounts = (
  accounts: ExtensionAccount[],
  ss58: number
) => {
  accounts = accounts
    // Remove accounts that do not contain correctly formatted addresses
    .filter(({ address }) => isValidAddress(address))
    // Reformat addresses to ensure default ss58 format
    .map((account) => {
      const formattedAddress = formatAccountSs58(account.address, ss58)
      if (!formattedAddress) {
        return null
      }
      account.address = formattedAddress
      return account
    })
    // Remove null entries resulting from invalid formatted addresses
    .filter((account) => account !== null)

  return accounts
}

// Updates accounts observable based on removed and added accounts
export const updateAccounts = ({
  add,
  remove,
}: {
  add: ExtensionAccount[]
  remove: ExtensionAccount[]
}) => {
  const newAccounts = [..._extensionAccounts.getValue()]
    .concat(add)
    .filter((a) => remove.find((s) => s.address === a.address) === undefined)
  _extensionAccounts.next(newAccounts)
}
