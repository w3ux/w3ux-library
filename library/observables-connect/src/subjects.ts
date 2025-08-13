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

// NOTE: These subjects stay private to the package and are not exported

export const _extensionsStatus = new BehaviorSubject<ExtensionsStatus>({})
export const _gettingExtensions = new BehaviorSubject<boolean>(true)
export const _initialisedExtensions = new BehaviorSubject<string[]>([])
export const _reconnectSync = new BehaviorSubject<Sync>('unsynced')
export const _extensionAccounts = new BehaviorSubject<ExtensionAccount[]>([])
export const _hardwareAccounts = new BehaviorSubject<HardwareAccount[]>(
	getHardwareAccountsLocal(),
)
