/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { FunctionComponent, SVGProps } from 'react'

// ----------------------------------------------------------------
// Common
// ----------------------------------------------------------------

export type MaybeString = string | null

export type Sync = 'synced' | 'unsynced' | 'syncing'

export type VoidFn = () => void

// ----------------------------------------------------------------
// Accounts
// ----------------------------------------------------------------

export type HardwareAccountSource = 'ledger' | 'vault' | 'wallet_connect'

export type Account = ExtensionAccount | HardwareAccount

export type ExtensionAccount = AccountCommon & {
	signer?: unknown
}

export type HardwareAccount = AccountCommon & {
	network: string
	group: number
	index: number
}

export interface AccountCommon {
	address: string
	name: string
	source: string
}

// ----------------------------------------------------------------
// Extensions
// ----------------------------------------------------------------

export type ExtensionStatus = 'installed' | 'not_authenticated' | 'connected'

export type ExtensionsStatus = Record<string, ExtensionStatus>

export interface ExtensionInjected extends ExtensionConfig {
	enable: (n?: string) => Promise<ExtensionInterface>
}

export interface ExtensionInterface {
	accounts: {
		subscribe: (a: (b: ExtensionAccount[]) => void) => VoidFn
		get: () => Promise<ExtensionAccount[]>
	}
	provider: unknown
	metadata: unknown
	signer: unknown
}

export interface ExtensionConfig {
	id: string
	title: string
	icon: FunctionComponent<
		SVGProps<SVGSVGElement> & { title?: string | undefined }
	>
	url: string
}

export type RawExtensionEnable = (name?: string) => Promise<ExtensionInterface>

export type RawExtensions = Map<string, RawExtensionEnable>

export type ExtensionEnableStatus =
	| 'valid'
	| 'extension_not_found'
	| 'enable_invalid'

export type ExtensionEnableResults = Map<string, ExtensionEnableResult>

export interface ExtensionEnableResult {
	extension: ExtensionInterface | null
	connected: boolean
	error?: string
}

export interface ProcessExtensionAccountsResult {
	newAccounts: ExtensionAccount[]
	removedAccounts: ExtensionAccount[]
}
