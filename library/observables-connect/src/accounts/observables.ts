/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { ImportedAccount, Sync } from '@w3ux/types'
import { BehaviorSubject } from 'rxjs'

// Sync status of extension account import
export const _importSync = new BehaviorSubject<Sync>('unsynced')
export const importSync$ = _importSync.asObservable()

// Imported extension accounts
export const _accounts = new BehaviorSubject<ImportedAccount[]>([])
export const accounts$ = _accounts.asObservable()
