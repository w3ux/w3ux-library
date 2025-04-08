/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type {
  ExtensionEnableResult,
  ExtensionEnableResults,
  ExtensionInterface,
  RawExtensionEnable,
  RawExtensions,
} from '@w3ux/types'
import { isExtensionLocal, removeExtensionFromLocal } from './local'

// Get extensions and enable them
export const enableExtensions = async (ids: string[], dappName: string) => {
  const extensions = getExtensionsById(ids)
  return formatEnabledExtensions(
    extensions,
    await doEnableExtensions(extensions, dappName)
  )
}

// Gets extensions from injectedWeb3 by their ids
export const getExtensionsById = (ids: string[]) => {
  const extensions = new Map<string, RawExtensionEnable>()
  ids.forEach(async (id) => {
    if (isExtensionLocal(id)) {
      const enable = window.injectedWeb3?.[id]?.enable
      if (enable !== undefined && typeof enable === 'function') {
        extensions.set(id, enable)
      } else {
        removeExtensionFromLocal(id)
      }
    }
  })
  return extensions
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

// Calls enable for the provided extensions
export const doEnableExtensions = async (
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
