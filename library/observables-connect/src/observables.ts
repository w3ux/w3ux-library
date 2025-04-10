/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type {
  ExtensionAccount,
  ExtensionsStatus,
  HardwareAccount,
  Sync,
} from '@w3ux/types'
import { BehaviorSubject } from 'rxjs'
import { getHardwareAccountsLocal } from './local'

// Discovered extensions along with their status
export const _extensionsStatus = new BehaviorSubject<ExtensionsStatus>({})
export const extensionsStatus$ = _extensionsStatus.asObservable()

// Whether extensions are being checked
export const _gettingExtensions = new BehaviorSubject<boolean>(true)
export const gettingExtensions$ = _gettingExtensions.asObservable()

// Extensions that have successfully connected
export const _initialisedExtensions = new BehaviorSubject<string[]>([])
export const initialisedExtensions$ = _initialisedExtensions.asObservable()

// Sync status of reconnecting to previously enabled extensions
export const _reconnectSync = new BehaviorSubject<Sync>('unsynced')
export const reconnectSync$ = _reconnectSync.asObservable()

// Imported extension accounts
export const _extensionAccounts = new BehaviorSubject<ExtensionAccount[]>([])
export const extensionAccounts$ = _extensionAccounts.asObservable()

// Imported hardware accounts
export const _hardwareAccounts = new BehaviorSubject<HardwareAccount[]>(
  getHardwareAccountsLocal()
)
export const hardwareAccounts$ = _hardwareAccounts.asObservable()
