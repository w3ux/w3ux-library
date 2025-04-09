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

  const interval = 200
  const maxChecks = 10
  const minVerifications = 2

  // Getter for the currently installed extensions
  let counter = 0
  let verifications = 0
  injectedWeb3Interval = setInterval(() => {
    counter++
    if (counter === maxChecks) {
      handleCompleted(false)
    } else {
      const injected = window?.injectedWeb3

      // Check if injected exists and all extensions have a valid enable function
      const ready =
        injected !== undefined &&
        Object.entries(injected).every(
          ([, ext]) => ext && typeof ext.enable === 'function'
        )

      // Increment verifications if the extensions are ready
      if (ready) {
        verifications++
      } else {
        verifications = 0
      }

      if (counter > 2 && verifications >= minVerifications) {
        handleCompleted(true)
      }
    }
  }, interval)
}
