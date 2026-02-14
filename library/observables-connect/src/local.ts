/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { HardwareAccount } from '@w3ux/types'
import { localStorageOrDefault } from '@w3ux/utils'
import { ActiveExtensionsKey, HardwareAccountsKey } from './consts'

// Gets all active extensions from local storage
export const getActiveExtensionsLocal = (): string[] => {
	const current = localStorageOrDefault<string[]>(ActiveExtensionsKey, [], true)
	return Array.isArray(current) ? current : []
}

// Check if an extension exists in local storage
export const isExtensionLocal = (id: string): boolean =>
	getActiveExtensionsLocal().includes(id)

// Adds an extension to local storage
export const addExtensionToLocal = (id: string): void => {
	const current = getActiveExtensionsLocal()
	if (!current.includes(id)) {
		localStorage.setItem(ActiveExtensionsKey, JSON.stringify([...current, id]))
	}
}

// Removes extension from local storage
export const removeExtensionFromLocal = (id: string): void => {
	const current = getActiveExtensionsLocal()
	localStorage.setItem(
		ActiveExtensionsKey,
		JSON.stringify(current.filter((localId) => localId !== id)),
	)
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null

const asHardwareAccount = (value: unknown): HardwareAccount | null => {
	if (!isRecord(value)) {
		return null
	}

	const { address, name, source, network, index, group } = value

	if (
		typeof address !== 'string' ||
		typeof name !== 'string' ||
		typeof source !== 'string' ||
		typeof network !== 'string' ||
		typeof index !== 'number' ||
		!Number.isFinite(index)
	) {
		return null
	}

	// NOTE: Feb 14, 2026 - `group` is a recently added property, so we allow it to be optional for
	// backward compatibility for the time being
	if (group === undefined) {
		return {
			...value,
			address,
			name,
			source,
			network,
			index,
			group: 1,
		} as HardwareAccount
	}

	if (typeof group !== 'number' || !Number.isFinite(group)) {
		return null
	}

	return {
		...value,
		address,
		name,
		source,
		network,
		index,
		group,
	} as HardwareAccount
}

// Gets imported hardware accounts from local storage
export const getHardwareAccountsLocal = (): HardwareAccount[] => {
	const stored = localStorageOrDefault(HardwareAccountsKey, [], true)
	if (!Array.isArray(stored)) {
		return []
	}

	return stored
		.map((account) => asHardwareAccount(account))
		.filter((account): account is HardwareAccount => account !== null)
}
