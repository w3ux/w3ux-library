/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type {
  ExtensionAccount,
  ExtensionEnableResult,
  ExtensionEnableResults,
  ExtensionInterface,
  RawExtensionEnable,
  RawExtensions,
} from '@w3ux/types'
import { formatAccountSs58 } from '@w3ux/utils'
import { isExtensionLocal, removeExtensionFromLocal } from '../extensions/local'
import { DefaultSS58 } from './consts'

// Gets raw extensions by their ids
export const getExtensionsById = (extensionIds: string[]) => {
  const rawExtensions = new Map<string, RawExtensionEnable>()

  extensionIds.forEach(async (id) => {
    if (isExtensionLocal(id)) {
      const { enable } = window.injectedWeb3[id]
      if (enable !== undefined && typeof enable === 'function') {
        rawExtensions.set(id, enable)
      } else {
        removeExtensionFromLocal(id)
      }
    }
  })
  return rawExtensions
}

// Calls enable for the provided extensions
export const enableExtensions = async (
  extensions: RawExtensions,
  dappName: string
) => {
  try {
    return await Promise.allSettled(
      Array.from(extensions.values()).map((fn) => fn(dappName))
    )
  } catch (e) {
    console.error("Error during 'enable' extensions call: ", e)
    return []
  }
}

// Formats the results of an extension's enable function
export const formatEnabledExtensions = (
  extensions: RawExtensions,
  results: PromiseSettledResult<ExtensionInterface>[]
): ExtensionEnableResults => {
  const extensionsState = new Map<string, ExtensionEnableResult>()

  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    const id = Array.from(extensions.keys())[i]

    if (result.status === 'fulfilled') {
      extensionsState.set(id, {
        extension: result.value,
        connected: true,
      })
    } else if (result.status === 'rejected') {
      extensionsState.set(id, {
        connected: false,
        error: result.reason,
      })
    }
  }
  return extensionsState
}

// Get successfully connected extensions
export const connectedExtensions = (
  extensions: ExtensionEnableResults
): ExtensionEnableResults =>
  new Map(
    Array.from(extensions.entries()).filter(([, state]) => state.connected)
  )

// Get extensions that failed to connect
export const extensionsWithError = (
  extensions: ExtensionEnableResults
): ExtensionEnableResults =>
  new Map(
    Array.from(extensions.entries()).filter(([, state]) => !state.connected)
  )

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
