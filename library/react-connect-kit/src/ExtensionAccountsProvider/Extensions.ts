/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { ExtensionAccount } from '@w3ux/types'
import { formatAccountSs58, localStorageOrDefault } from '@w3ux/utils'
import type { ExtensionInterface } from '../ExtensionsProvider/types'
import type {
  ExtensionEnableResult,
  ExtensionEnableResults,
  RawExtensionEnable,
  RawExtensions,
} from '../types'
import { DEFAULT_SS58 } from './defaults'

// A static class to manage the discovery and importing of extensions.
export class Extensions {
  // Gets a map of extensions with their enable functions from `injectedWeb3`.
  static getFromIds = (extensionIds: string[]): RawExtensions => {
    const rawExtensions = new Map<string, RawExtensionEnable>()

    extensionIds.forEach(async (id) => {
      if (this.isLocal(id)) {
        const { enable } = window.injectedWeb3[id]

        if (enable !== undefined && typeof enable === 'function') {
          rawExtensions.set(id, enable)
        } else {
          this.removeFromLocal(id)
        }
      }
    })
    return rawExtensions
  }

  // Calls `enable` for the provided extensions.
  static enable = async (
    extensions: RawExtensions,
    dappName: string
  ): Promise<PromiseSettledResult<ExtensionInterface>[]> => {
    try {
      const results = await Promise.allSettled(
        Array.from(extensions.values()).map((enable) => enable(dappName))
      )
      return results
    } catch (err) {
      console.error("Error during 'enable' call for Extensions: ", err)
      // Return an empty array if an error occurs.
      return []
    }
  }

  // Formats the results of an extension's `enable` function.
  static formatEnabled = (
    extensions: RawExtensions,
    results: PromiseSettledResult<ExtensionInterface>[]
  ): ExtensionEnableResults => {
    // Accumulate resulting extensions state after attempting to enable.
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

  // Return successfully connected extensions.
  static connected = (
    extensions: ExtensionEnableResults
  ): ExtensionEnableResults =>
    new Map(
      Array.from(extensions.entries()).filter(([, state]) => state.connected)
    )

  static withError = (
    extensions: ExtensionEnableResults
  ): ExtensionEnableResults =>
    new Map(
      Array.from(extensions.entries()).filter(([, state]) => !state.connected)
    )

  // Calls `enable` and formats the results of an extension's `enable` function.
  static getAllAccounts = async (
    extensions: ExtensionEnableResults
  ): Promise<ExtensionAccount[]> => {
    try {
      const results = await Promise.allSettled(
        Array.from(extensions.values()).map(({ extension }) =>
          extension.accounts.get()
        )
      )

      const extensionEntries = Array.from(extensions.entries())
      const all: ExtensionAccount[] = []

      for (let i = 0; i < results.length; i++) {
        const result = results[i]
        const id = extensionEntries[i][0]
        const signer = extensionEntries[i][1].extension.signer

        if (result.status === 'fulfilled') {
          const filtered = result.value
            // Reformat addresses with default ss58 prefix.
            .map((account) => {
              const formattedAddress = formatAccountSs58(
                account.address,
                DEFAULT_SS58
              )
              if (!formattedAddress) {
                return null
              }
              return {
                ...account,
                address: formattedAddress,
              }
            })
            // Remove null entries resulting from invalid formatted addresses.
            .filter((account) => account !== null)
            // Remove accounts that have already been imported.
            .filter(
              ({ address }) =>
                !all.find(
                  (currentAccount) => address === currentAccount.address
                )
            )
            // Reformat entries to include extension source.
            .map(({ address, name }) => ({
              address,
              name,
              source: id,
              signer,
            }))

          all.push(...filtered)
        }
      }

      return all
    } catch (err) {
      // Return an empty array if an error occurs.
      console.error(
        "Error during 'enable' and format call for Extensions: ",
        err
      )
      return []
    }
  }

  // Check if an extension exists in local `active_extensions`.
  static isLocal = (id: string): boolean => {
    const current = localStorageOrDefault<string[]>(
      `active_extensions`,
      [],
      true
    )
    let isLocal = false
    if (Array.isArray(current)) {
      isLocal = current.find((l) => l === id) !== undefined
    }
    return !!isLocal
  }

  // Adds an extension to local `active_extensions`.
  static addToLocal = (id: string): void => {
    const current = localStorageOrDefault<string[]>(
      `active_extensions`,
      [],
      true
    )
    if (Array.isArray(current)) {
      if (!current.includes(id)) {
        current.push(id)
        localStorage.setItem('active_extensions', JSON.stringify(current))
      }
    }
  }

  // Removes extension from local `active_extensions`.
  static removeFromLocal = (id: string): void => {
    let current = localStorageOrDefault<string[]>(`active_extensions`, [], true)
    if (Array.isArray(current)) {
      current = current.filter((localId: string) => localId !== id)
      localStorage.setItem('active_extensions', JSON.stringify(current))
    }
  }
}
