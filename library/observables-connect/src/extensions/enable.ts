/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type {
  ExtensionEnableResult,
  ExtensionEnableResults,
  ExtensionInterface,
} from '@w3ux/types'
import { withTimeoutThrow } from '@w3ux/utils'

// Get extensions and enable them
export const enableExtensions = async (ids: string[], dappName: string) => {
  const extensionIds = getExtensionsById(ids)
  const enableResults = await doEnable(extensionIds, dappName)

  return formatEnabledExtensions(extensionIds, enableResults)
}

// Gets extensions from injectedWeb3 by their ids
const getExtensionsById = (ids: string[]) => {
  const validIds: string[] = []
  ids.forEach(async (id) => {
    const enable = window.injectedWeb3?.[id]?.enable
    if (enable !== undefined && typeof enable === 'function') {
      validIds.push(id)
    }
  })
  return validIds
}

// Calls enable for the provided extensions
const doEnable = async (
  extensionIds: string[],
  dappName: string
): Promise<PromiseSettledResult<ExtensionInterface>[]> => {
  const results: PromiseSettledResult<ExtensionInterface>[] = []
  for (const id of extensionIds) {
    // Give the extension up to 1 second to respond
    const result = (await withTimeoutThrow(
      1000,
      settle(window.injectedWeb3[id].enable(dappName))
    )) as PromiseSettledResult<ExtensionInterface>

    results.push(result)
  }
  return results
}

// Formats the results of an extension's enable function
const formatEnabledExtensions = (
  extensionIds: string[],
  enabledResults: PromiseSettledResult<ExtensionInterface>[]
): ExtensionEnableResults => {
  const extensionsState = new Map<string, ExtensionEnableResult>()

  for (let i = 0; i < enabledResults.length; i++) {
    const result = enabledResults[i]
    const id = extensionIds[i]

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

// Helper function to settle a promise with either fulfilled or rejected result
const settle = <T>(promise: Promise<T>): Promise<PromiseSettledResult<T>> =>
  promise
    .then(
      (value): PromiseFulfilledResult<T> => ({ status: 'fulfilled', value })
    )
    .catch((reason): PromiseRejectedResult => ({ status: 'rejected', reason }))
