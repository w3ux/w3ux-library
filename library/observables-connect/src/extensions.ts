/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import extensions from '@w3ux/extension-assets'
import { _extensionsStatus, _gettingExtensions } from './index'

// Gets the status of currently discovered extensions
const formatExtensionsInstalled = () => {
  const { injectedWeb3 } = window
  const value = _extensionsStatus.getValue()
  return Object.keys(extensions).reduce(
    (acc, key) => {
      acc[key] = injectedWeb3[key] !== undefined ? 'installed' : value[key]
      return acc
    },
    { ...value }
  )
}

// Gets extensions from injectedWeb3
export const getExtensions = async () => {
  _gettingExtensions.next(true)
  let injectedWeb3Interval: ReturnType<typeof setInterval> = null

  // Handle completed interval check
  const handleCompleted = async (foundExtensions: boolean) => {
    clearInterval(injectedWeb3Interval)
    if (foundExtensions) {
      _extensionsStatus.next(formatExtensionsInstalled())
    }
    _gettingExtensions.next(false)
  }

  // Getter for the currently installed extensions every 300ms
  // Checks a maximum of 10 times
  let counter = 0
  injectedWeb3Interval = setInterval(() => {
    counter++
    if (counter === 10) {
      handleCompleted(false)
    } else {
      // `injectedWeb3` is present
      const injectedWeb3 = window?.injectedWeb3 || null
      if (injectedWeb3 !== null) {
        handleCompleted(true)
      }
    }
  }, 300)
}
