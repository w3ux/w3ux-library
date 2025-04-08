/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { ExtensionAccount, HandleImportExtension } from '@w3ux/types'
import { formatAccountSs58, isValidAddress } from '@w3ux/utils'
import { defaultHandleImportExtension } from './defaults'
import { getActiveAccountLocal, getInExternalAccounts } from './utils'

export const useImportExtension = () => {
  // Handles importing of extension accounts.
  //
  // Gets accounts to be imported and commits them to state.
  const handleExtensionAccountsUdpdate = (
    id: string,
    currentAccounts: ExtensionAccount[],
    signer: unknown,
    newAccounts: ExtensionAccount[],
    network: string,
    ss58: number
  ): HandleImportExtension => {
    if (!newAccounts.length) {
      return defaultHandleImportExtension
    }

    // Remove accounts that do not contain correctly formatted addresses.
    newAccounts = newAccounts.filter(({ address }) => isValidAddress(address))

    // Reformat addresses to ensure default ss58 format.
    newAccounts
      .map((account) => {
        const formattedAddress = formatAccountSs58(account.address, ss58)
        if (!formattedAddress) {
          return null
        }
        account.address = formattedAddress
        return account
      })
      // Remove null entries resulting from invalid formatted addresses.
      .filter((account) => account !== null)

    // Remove `newAccounts` from local external accounts if present.
    const inExternal = getInExternalAccounts(newAccounts, network)

    // Find any accounts that have been removed from this extension.
    const removedAccounts = currentAccounts
      .filter((j) => j.source === id)
      .filter((j) => !newAccounts.find((i) => i.address === j.address))

    // Check whether active account is present in forgotten accounts.
    const removedActiveAccount =
      removedAccounts.find(
        ({ address }) => address === getActiveAccountLocal(network, ss58)
      )?.address || null

    // Remove accounts that have already been added to `currentAccounts` via another extension.
    newAccounts = newAccounts.filter(
      ({ address }) =>
        !currentAccounts.find(
          (j) => j.address === address && j.source !== 'external'
        )
    )

    // Format accounts properties.
    newAccounts = newAccounts.map(({ address, name }) => ({
      address,
      name,
      source: id,
      signer,
    }))

    return {
      newAccounts,
      meta: {
        accountsToRemove: [...inExternal, ...removedAccounts],
        removedActiveAccount,
      },
    }
  }

  return {
    handleExtensionAccountsUdpdate,
  }
}
