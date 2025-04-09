/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type {
  ExtensionAccount,
  HandleImportExtension,
  ImportedAccount,
} from '@w3ux/types'
import { formatAccountSs58, isValidAddress } from '@w3ux/utils'
import { DefaultHandleImportExtension } from '../consts'
import { getActiveAccountLocal, getLocalExternalAccounts } from './local'

// Gets accounts to be imported and commits them to state

interface Config {
  source: string
  ss58: number
  network: string
}
export const processExtensionAccounts = (
  config: Config,
  currentAccounts: ExtensionAccount[],
  signer: unknown,
  accounts: ExtensionAccount[]
): HandleImportExtension => {
  const { source, ss58, network } = config
  if (!accounts.length) {
    return DefaultHandleImportExtension
  }

  // Get valid accounts from extension
  accounts = formatExtensionAccounts(accounts, ss58)

  // Remove accounts from local external accounts if present
  const inExternal = getInExternalAccounts(accounts, network)

  // Find any accounts that have been removed from this extension
  const removedAccounts = currentAccounts
    .filter((j) => j.source === source)
    .filter((j) => !accounts.find((i) => i.address === j.address))

  // Check whether active account is present in forgotten accounts
  const removedActiveAccount =
    removedAccounts.find(
      ({ address }) => address === getActiveAccountLocal(network, ss58)
    )?.address || null

  // Remove accounts that have already been added to `currentAccounts` via another extension
  accounts = accounts.filter(
    ({ address }) =>
      !currentAccounts.find(
        (j) => j.address === address && j.source !== 'external'
      )
  )

  // Format accounts properties
  accounts = accounts.map(({ address, name }) => ({
    address,
    name,
    source,
    signer,
  }))

  return {
    newAccounts: accounts,
    meta: {
      accountsToRemove: [...inExternal, ...removedAccounts],
      removedActiveAccount,
    },
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

// Gets accounts that exist in local external accounts
export const getInExternalAccounts = (
  accounts: ImportedAccount[],
  network: string
) => {
  const localExternalAccounts = getLocalExternalAccounts(network)
  return (
    localExternalAccounts.filter(
      (a) => (accounts || []).find((b) => b.address === a.address) !== undefined
    ) || []
  )
}
