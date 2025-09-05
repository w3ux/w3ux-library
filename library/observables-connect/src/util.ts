/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { ExtensionStatus, HardwareAccount, Sync } from '@w3ux/types'
import {
	_extensionAccounts,
	_extensionsStatus,
	_hardwareAccounts,
	_reconnectSync,
} from './subjects'

// Gets an extension status
export const getStatus = (id: string): ExtensionStatus =>
	_extensionsStatus.getValue()[id] || undefined

// Sets an extension status
export const setStatus = (id: string, status: ExtensionStatus) => {
	const newValue = { ..._extensionsStatus.getValue() }
	newValue[id] = status
	_extensionsStatus.next(newValue)
}

// Removes an extension status
export const removeStatus = (id: string) => {
	const { [id]: _, ...rest } = _extensionsStatus.getValue()
	_extensionsStatus.next(rest)
}

// Whether an extension can be connected
export const canConnect = (id: string) =>
	![undefined, 'connected'].includes(_extensionsStatus.getValue()[id])

// Reset accounts
export const resetAccounts = () => {
	_extensionAccounts.next([])
}

// Get previously enabled extension reconnect sync status
export const getReconnectSync = () => _reconnectSync.getValue()

// Set previously enabled extension reconnect sync status
export const setReconnectSync = (sync: Sync) => {
	_reconnectSync.next(sync)
}

// Get hardware accounts
export const getHardwareAccounts = () => _hardwareAccounts.getValue()

// Set hardware accounts
export const setHardwareAccounts = (accounts: HardwareAccount[]) => {
	_hardwareAccounts.next(accounts)
}

// Checks whether app is open in an iframe
export const isInIframe = (): boolean => window.self !== window.top

// Check if an injected web3 entry has a valid enable function
export const hasValidEnable = (id: string): boolean => {
	try {
		const enable = isInIframe()
			? window.parent.injectedWeb3![id].enable
			: window.injectedWeb3![id].enable

		return enable !== undefined && typeof enable === 'function'
	} catch {
		return false
	}
}

// Enable an injected web3 entry
export const enableInjectedWeb3Entry = (id: string, dappName: string) => {
	if (isInIframe()) {
		const result = window.parent.injectedWeb3![id].enable(dappName)
		return result
	}
	const result = window.injectedWeb3![id].enable(dappName)
	return result
}
