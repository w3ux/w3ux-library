/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

export type MaybeString = string | null

export type HexString = `0x${string}`

export type Sync = 'synced' | 'unsynced' | 'syncing'

export type VoidFn = () => void
