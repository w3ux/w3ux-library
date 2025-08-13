/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { HardwareAccount, HardwareAccountSource } from '@w3ux/types'

export interface HardwareAccountsContextInterface {
	hardwareAccountExists: (
		source: HardwareAccountSource,
		network: string,
		a: string,
	) => boolean
	addHardwareAccount: (
		source: HardwareAccountSource,
		network: string,
		address: string,
		index: number,
		callback?: () => void,
	) => HardwareAccount | null
	removeHardwareAccount: (
		source: HardwareAccountSource,
		network: string,
		address: string,
		callback?: () => void,
	) => void
	renameHardwareAccount: (
		source: HardwareAccountSource,
		network: string,
		address: string,
		name: string,
	) => void
	getHardwareAccount: (
		source: HardwareAccountSource,
		network: string,
		address: string,
	) => HardwareAccount | null
	getHardwareAccounts: (
		source: HardwareAccountSource,
		network: string,
	) => HardwareAccount[]
}
