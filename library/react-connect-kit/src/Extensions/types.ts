/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type {
	Account,
	ExtensionAccount,
	ExtensionStatus,
	Sync,
} from '@w3ux/types'
import type { ReactNode } from 'react'

export interface ExtensionsConnectContextInterface {
	gettingExtensions: boolean
	extensionsStatus: Record<string, ExtensionStatus>
	setExtensionStatus: (id: string, status: ExtensionStatus) => void
	removeExtensionStatus: (id: string) => void
	extensionInstalled: (id: string) => boolean
	extensionCanConnect: (id: string) => boolean
}

export interface ExtensionAccountsContextInterface {
	extensionsInitialised: string[]
	connectExtension: (id: string) => Promise<boolean>
	extensionsSynced: Sync
	getExtensionAccount: (
		address: string,
		source: string,
	) => ExtensionAccount | undefined
	getExtensionAccounts: (ss58: number) => Account[]
}

export interface ExtensionsProviderProps {
	children: ReactNode
	ss58: number
	dappName: string
}
