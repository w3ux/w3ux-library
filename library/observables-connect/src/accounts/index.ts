/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { ExtensionAccount, ExtensionEnableResults } from '@w3ux/types'
import { formatAccountSs58 } from '@w3ux/utils'
import { DefaultSS58 } from './consts'

// Connects to the provided extensions and fetches their accounts
export const getAccountsFromExtensions = async (
  extensions: ExtensionEnableResults
): Promise<ExtensionAccount[]> => {
  try {
    const results = await Promise.allSettled(
      Array.from(extensions.values()).map(({ extension }) =>
        extension.accounts.get()
      )
    )
    const extensionEntries = Array.from(extensions.entries())
    const accounts: ExtensionAccount[] = []

    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      const source = extensionEntries[i][0]
      const signer = extensionEntries[i][1].extension.signer

      if (result.status === 'fulfilled') {
        const filtered = result.value
          // Reformat addresses with default ss58 prefix
          .map((account) => {
            const adddress = formatAccountSs58(account.address, DefaultSS58)
            if (!adddress) {
              return null
            }
            return {
              ...account,
              adddress,
            }
          })
          // Remove null entries resulting from invalid formatted addresses
          .filter((a) => a !== null)
          // Remove accounts that have already been imported
          .filter(({ address }) => !accounts.find((a) => address === a.address))
          // Reformat entries to include extension source
          .map(({ address, name }) => ({
            address,
            name,
            source,
            signer,
          }))

        accounts.push(...filtered)
      }
    }
    return accounts
  } catch (e) {
    console.error('Error during enable and format call: ', e)
    return []
  }
}
