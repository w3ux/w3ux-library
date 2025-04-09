/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { Sync } from '@w3ux/types'
import { _accounts, _reconnectSync } from './observables'

export const unsubs: Record<string, () => void> = {}

// Add an extension id to unsub state
export const addUnsub = (id: string, unsub: () => void) => {
  unsubs[id] = unsub
}

// Unsubscribe to all unsubs
export const unsubAll = () => {
  Object.values(unsubs).forEach((unsub) => {
    unsub()
  })
}

// Reset accounts
export const resetAccounts = () => {
  _accounts.next([])
}

// Get previously enabled extension reconnect sync status
export const getReconnectSync = () => _reconnectSync.getValue()

// Set previously enabled extension reconnect sync status
export const setReconnectSync = (sync: Sync) => {
  _reconnectSync.next(sync)
}
