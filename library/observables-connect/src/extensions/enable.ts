/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type {
	ExtensionEnableResult,
	ExtensionEnableResults,
	ExtensionInterface,
} from '@w3ux/types'
import { enableInjectedWeb3Entry, hasValidEnable } from '../util'

// Get extensions and enable them
export const enableExtensions = async (ids: string[], dappName: string) => {
	const extensionIds = getExtensionsById(ids)
	const enableResults = await doEnable(extensionIds, dappName)

	return formatEnabledExtensions(extensionIds, enableResults)
}

// Gets extensions from injectedWeb3 by their ids
const getExtensionsById = (ids: string[]) => {
	const validIds: string[] = []
	ids.forEach((id) => {
		if (hasValidEnable(id)) {
			validIds.push(id)
		}
	})
	return validIds
}

// Calls enable for the provided extensions
const doEnable = async (
	extensionIds: string[],
	dappName: string,
): Promise<PromiseSettledResult<ExtensionInterface>[]> =>
	await Promise.allSettled(
		Array.from(extensionIds).map((id) => enableInjectedWeb3Entry(id, dappName)),
	)

const formatEnabledExtensions = (
	extensionIds: string[],
	enabledResults: PromiseSettledResult<ExtensionInterface>[],
): ExtensionEnableResults => {
	const extensionsState = new Map<string, ExtensionEnableResult>()

	for (let i = 0; i < enabledResults.length; i++) {
		const result = enabledResults[i]
		const id = extensionIds[i]

		if (result.status === 'fulfilled') {
			extensionsState.set(id, {
				extension: result.value,
				connected: true,
			})
		} else if (result.status === 'rejected') {
			extensionsState.set(id, {
				extension: null,
				connected: false,
				error: result.reason,
			})
		}
	}
	return extensionsState
}
