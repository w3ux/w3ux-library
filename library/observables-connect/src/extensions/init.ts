/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { ExtensionEnableResults } from '@w3ux/types'
import { addExtensionToLocal, removeExtensionFromLocal } from '../local'
import { _extensionsStatus, _initialisedExtensions } from '../subjects'
import { enableExtensions } from './enable'

// Connects to previously connected extensions, or to a specific set of extensions
export const initExtensions = async (
  dappName: string,
  extensionIds: string[]
): Promise<{ connected: ExtensionEnableResults }> => {
  if (!extensionIds.length) {
    return {
      connected: new Map(),
    }
  }
  // Get extensions and enable them
  const enableResults = await enableExtensions(extensionIds, dappName)

  // Determine which extensions are connected and which have errors
  const [connected, withError] = [
    filterConnectedExtensions(enableResults),
    filterFailedExtensions(enableResults),
  ]

  // Manage local storage depending on connection status
  Array.from(connected.keys()).forEach((id) => addExtensionToLocal(id))
  Array.from(withError.keys()).forEach((id) => removeExtensionFromLocal(id))

  // Handle new extension statuses
  const newStatus = { ..._extensionsStatus.getValue() }
  Array.from(connected.keys()).forEach((id) => {
    newStatus[id] = 'connected'
  })
  Array.from(withError.entries()).forEach(([id, { error }]) => {
    if (error?.startsWith('Error')) {
      // Extension not found - remove from state
      if (error.substring(0, 17) === 'NotInstalledError') {
        delete newStatus[id]
      } else {
        // Assume extension not authenticated
        newStatus[id] = 'not_authenticated'
      }
    }
  })

  // Record initialised extensions
  const newInitialised = [..._initialisedExtensions.getValue()]
  extensionIds.forEach((id) => {
    if (!newInitialised.includes(id)) {
      newInitialised.push(id)
    }
  })

  // Commit updates to observables
  _extensionsStatus.next(newStatus)
  _initialisedExtensions.next(newInitialised)

  return { connected }
}

// Filter successfully connected extensions
const filterConnectedExtensions = (
  extensions: ExtensionEnableResults
): ExtensionEnableResults =>
  new Map(
    Array.from(extensions.entries()).filter(([, state]) => state.connected)
  )

// Filter extensions that failed to connect
const filterFailedExtensions = (
  extensions: ExtensionEnableResults
): ExtensionEnableResults =>
  new Map(
    Array.from(extensions.entries()).filter(([, state]) => !state.connected)
  )
