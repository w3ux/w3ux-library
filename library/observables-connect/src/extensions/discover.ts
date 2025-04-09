/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import extensions from '@w3ux/extension-assets'
import { _extensionsStatus, _gettingExtensions } from './observables'

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
      // `injectedWeb3` is present & at least 2 checks have passed
      const injectedWeb3 = window?.injectedWeb3 || null
      if (injectedWeb3 !== null && counter > 2) {
        handleCompleted(true)
      }
    }
  }, interval)
}
