/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { ExtensionStatus } from '@w3ux/types'
import { _extensionsStatus } from './observables'

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
