/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import extensions from '@w3ux/extension-assets'
import type { ExtensionStatus } from '@w3ux/types'
import { _extensionsStatus, _gettingExtensions } from './index'

// Gets extensions from injectedWeb3
export const getExtensions = async () => {
  _gettingExtensions.next(true)
  let injectedWeb3Interval: ReturnType<typeof setInterval> = null

  // Find new installed extensions and update state
  const findInstalled = () => {
    let updated = false
    const current = _extensionsStatus.getValue()
    const installed = Object.keys(extensions).reduce(
      (acc, key) => {
        if (current[key] !== undefined) {
          return acc
        }
        const maybeExtension = window?.injectedWeb3?.[key]
        if (maybeExtension !== undefined) {
          updated = true
          acc[key] = 'installed'
        } else {
          acc[key] = undefined
        }
        return acc
      },
      { ...current }
    )
    return { installed, updated }
  }

  // Handle interval iteration
  const processInterval = async () => {
    const { installed, updated } = findInstalled()
    if (updated) {
      _extensionsStatus.next(installed)
    }
  }

  // Getter for the currently installed extensions
  let i = 0
  const interval = 300
  const maxChecks = 10
  injectedWeb3Interval = setInterval(() => {
    i++
    if (i === maxChecks) {
      _gettingExtensions.next(false)
      clearInterval(injectedWeb3Interval)
    } else {
      if (window?.injectedWeb3 !== undefined) {
        processInterval()
      }
    }
  }, interval)
}

// Gets an extension status
export const getStatus = (id: string): ExtensionStatus => {
  const value = _extensionsStatus.getValue()
  return value[id] || undefined
}

// Sets an extension status
export const setStatus = (id: string, status: ExtensionStatus) => {
  const value = _extensionsStatus.getValue()
  value[id] = status
  _extensionsStatus.next(value)
}

// Removes an extension status
export const removeStatus = (id: string) => {
  const { [id]: _, ...rest } = _extensionsStatus.getValue()
  _extensionsStatus.next(rest)
}

// Whether an extension can be connected
export const canConnect = (id: string) => {
  const value = _extensionsStatus.getValue()
  return ![undefined, 'connected'].includes(value[id])
}
