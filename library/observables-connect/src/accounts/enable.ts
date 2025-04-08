/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type {
  ExtensionEnableResult,
  ExtensionEnableResults,
  ExtensionInterface,
  RawExtensionEnable,
  RawExtensions,
} from '@w3ux/types'
import { isExtensionLocal, removeExtensionFromLocal } from '../extensions/local'

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
export const enable = async (extensions: RawExtensions, dappName: string) => {
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
