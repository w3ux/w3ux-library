/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { HardwareAccount } from '@w3ux/types'
import { localStorageOrDefault } from '@w3ux/utils'
import { ActiveExtensionsKey, HardwareAccountsKey } from './consts'

// Gets all active extensions from local storage
export const getActiveExtensionsLocal = (): string[] => {
  const current = localStorageOrDefault<string[]>(ActiveExtensionsKey, [], true)
  return Array.isArray(current) ? current : []
}

// Check if an extension exists in local storage
export const isExtensionLocal = (id: string): boolean =>
  getActiveExtensionsLocal().includes(id)

// Adds an extension to local storage
export const addExtensionToLocal = (id: string): void => {
  const current = getActiveExtensionsLocal()
  if (!current.includes(id)) {
    localStorage.setItem(ActiveExtensionsKey, JSON.stringify([...current, id]))
  }
}

// Removes extension from local storage
export const removeExtensionFromLocal = (id: string): void => {
  const current = getActiveExtensionsLocal()
  localStorage.setItem(
    ActiveExtensionsKey,
    JSON.stringify(current.filter((localId) => localId !== id))
  )
}

// Gets imported hardware accounts from local storage
export const getHardwareAccountsLocal = (): HardwareAccount[] => {
  const accounts = localStorageOrDefault(
    HardwareAccountsKey,
    [],
    true
  ) as HardwareAccount[]

  return accounts
}
