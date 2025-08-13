/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { ProcessExtensionAccountsResult } from '@w3ux/types'

export const DefaultProcessExtensionResult: ProcessExtensionAccountsResult = {
	newAccounts: [],
	removedAccounts: [],
}

// Local storage active extensions key
export const ActiveExtensionsKey = 'active_extensions'
export const HardwareAccountsKey = 'hardware_accounts'
