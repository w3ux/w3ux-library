/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { HardwareAccount } from '@w3ux/types'
import { localStorageOrDefault } from '@w3ux/utils'
import { activeExtensionsKey, hardwareAccountsKey } from './consts'

// Check if an extension exists in local storage
export const isExtensionLocal = (id: string): boolean => {
  const current = localStorageOrDefault<string[]>(activeExtensionsKey, [], true)
  return Array.isArray(current) && current.includes(id)
}

// Gets all active extensions from local storage
export const getActiveExtensionsLocal = (): string[] => {
  const current = localStorageOrDefault<string[]>(activeExtensionsKey, [], true)
  return Array.isArray(current) ? current : []
}

// Adds an extension to local storage
export const addExtensionToLocal = (id: string): void => {
  const current = localStorageOrDefault<string[]>(activeExtensionsKey, [], true)
  if (Array.isArray(current) && !current.includes(id)) {
    localStorage.setItem(activeExtensionsKey, JSON.stringify([...current, id]))
  }
}

// Removes extension from local storage
export const removeExtensionFromLocal = (id: string): void => {
  const current = localStorageOrDefault<string[]>(activeExtensionsKey, [], true)
  if (Array.isArray(current)) {
    localStorage.setItem(
      activeExtensionsKey,
      JSON.stringify(current.filter((localId) => localId !== id))
    )
  }
}

// Gets imported hardware accounts from local storage
export const getHardwareAccountsLocal = (): HardwareAccount[] => {
  const accounts = localStorageOrDefault(
    hardwareAccountsKey,
    [],
    true
  ) as HardwareAccount[]

  return accounts
}
