/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type {
  ExtensionAccount,
  ExtensionEnableResults,
  ExtensionInterface,
} from '@w3ux/types'
import { formatExtensionAccounts } from './util'

// Connects to provided extensions and gets all accounts
export const getAccountsFromExtensions = async (
  extensions: ExtensionEnableResults,
  ss58: number
): Promise<ExtensionAccount[]> => {
  try {
    const extensionEntries = Array.from(extensions.entries())
      .filter(([, { extension }]) => extension !== null)
      .map(
        ([source, { extension }]) =>
          [source, extension] as [string, ExtensionInterface]
      )

    const activeExtensions = extensionEntries.map(([, extension]) => extension)

    const results = await Promise.allSettled(
      activeExtensions.map((extension) => extension.accounts.get())
    )

    const allAccounts: ExtensionAccount[] = []
    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      const source = extensionEntries[i][0]
      const signer = extensionEntries[i][1].signer

      if (result.status === 'fulfilled' && signer) {
        const { value } = result

        // This is duplicating what `handleExtensionAccountsUpdate` is doing to accounts: --
        const accounts = formatExtensionAccounts(value, ss58)
          .filter(
            ({ address }) => !allAccounts.find((a) => address === a.address)
          )
          .map(({ address, name }) => ({
            address,
            name,
            source,
            signer,
          }))
        allAccounts.push(...accounts)
      }
    }
    return allAccounts
  } catch (e) {
    console.error('Error during account formatting: ', e)
    return []
  }
}
