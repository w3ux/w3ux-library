/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

// An optional string.
export type MaybeString = string | null

// A hex string
export type HexString = `0x${string}`

// A general purpose sync status, tracking whether an item is not synced, in progress, or completed
// syncing. Useful for tracking async function progress, used as React refs, etc.
export type Sync = 'synced' | 'unsynced' | 'syncing'

// A funtion with no arguments and no return value.
export type VoidFn = () => void
