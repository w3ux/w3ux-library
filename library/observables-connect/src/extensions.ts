/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import extensions from '@w3ux/extension-assets'
import type { ExtensionStatus } from '@w3ux/types'
import { _extensionsStatus, _gettingExtensions } from './index'

// Gets extensions from injectedWeb3
export const getExtensions = async () => {
  _gettingExtensions.next(true)
  let injectedWeb3Interval: ReturnType<typeof setInterval> = null

  // Format installed extensions
  const formatInstalled = () =>
    Object.keys(extensions).reduce(
      (acc, key) => {
        acc[key] =
          window?.injectedWeb3[key] !== undefined ? 'installed' : acc[key]
        return acc
      },
      { ..._extensionsStatus.getValue() }
    )

  // Handle completed interval check
  const handleCompleted = async (foundExtensions: boolean) => {
    clearInterval(injectedWeb3Interval)
    if (foundExtensions) {
      _extensionsStatus.next(formatInstalled())
    }
    _gettingExtensions.next(false)
  }

  // Getter for the currently installed extensions
  let counter = 0
  const interval = 300
  const maxChecks = 10
  injectedWeb3Interval = setInterval(() => {
    counter++
    if (counter === maxChecks) {
      handleCompleted(false)
    } else {
      // `injectedWeb3` is present
      const injectedWeb3 = window?.injectedWeb3 || null
      if (injectedWeb3 !== null) {
        handleCompleted(true)
      }
    }
  }, interval)
}

// Gets an extension status
export const getStatus = (id: string): ExtensionStatus =>
  _extensionsStatus.getValue()[id] || undefined

// Sets an extension status
export const setStatus = (id: string, status: ExtensionStatus) => {
  const newValue = { ..._extensionsStatus.getValue() }
  newValue[id] = status
  _extensionsStatus.next(newValue)
}

// Removes an extension status
export const removeStatus = (id: string) => {
  const { [id]: _, ...rest } = _extensionsStatus.getValue()
  _extensionsStatus.next(rest)
}

// Whether an extension can be connected
export const canConnect = (id: string) =>
  ![undefined, 'connected'].includes(_extensionsStatus.getValue()[id])
