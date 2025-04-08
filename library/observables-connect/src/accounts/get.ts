/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { ExtensionAccount, ExtensionEnableResults } from '@w3ux/types'
import { formatAccountSs58 } from '@w3ux/utils'
import { DefaultSS58 } from '../consts'

// Connects to provided extensions and gets all accounts
export const getAccountsFromExtensions = async (
  extensions: ExtensionEnableResults
): Promise<ExtensionAccount[]> => {
  try {
    const results = await Promise.allSettled(
      Array.from(extensions.values()).map(({ extension }) =>
        extension.accounts.get()
      )
    )

    const allAccounts: ExtensionAccount[] = []
    const extensionEntries = Array.from(extensions.entries())
    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      const source = extensionEntries[i][0]
      const signer = extensionEntries[i][1].extension.signer

      if (result.status === 'fulfilled') {
        const { value } = result
        const accounts = value
          .map((a) => {
            // Reformat addresses with default ss58 prefix
            const address = formatAccountSs58(a.address, DefaultSS58)
            if (!address) {
              return null
            }
            return {
              ...a,
              address,
            }
          })
          // Remove null entries resulting from invalid formatted addresses
          .filter((a) => a !== null)
          // Remove accounts that have already been imported
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
