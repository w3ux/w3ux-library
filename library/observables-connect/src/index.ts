/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { ExtensionsStatus } from '@w3ux/types'
import { BehaviorSubject } from 'rxjs'

// Whether extensions are being checked
export const _gettingExtensions = new BehaviorSubject<boolean>(true)
export const gettingExtensions$ = _gettingExtensions.asObservable()

// Discovered extensions along with their status
export const _extensionsStatus = new BehaviorSubject<ExtensionsStatus>({})
export const extensionsStatus$ = _extensionsStatus.asObservable()

// Discovered extension accounts
// export const _extensionAccounts = new BehaviorSubject<ImportedAccount[]>([])
// export const extensionAccounts$ = _extensionAccounts.asObservable()

// Sync status of extension accounts
// export const _extensionAccountsSync = new BehaviorSubject<Sync>('unsynced')
// export const extensionAccountsSync$ = _extensionAccountsSync.asObservable()
