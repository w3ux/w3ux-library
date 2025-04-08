/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { ImportedAccount, Sync } from '@w3ux/types'
import { BehaviorSubject } from 'rxjs'

// Sync status of extension accounts
export const _extensionAccountsSync = new BehaviorSubject<Sync>('unsynced')
export const extensionAccountsSync$ = _extensionAccountsSync.asObservable()

// Discovered extension accounts
export const _extensionAccounts = new BehaviorSubject<ImportedAccount[]>([])
export const extensionAccounts$ = _extensionAccounts.asObservable()
