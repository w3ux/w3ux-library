/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { ExtensionAccountsProvider } from './Accounts'
import { ExtensionsConnectProvider } from './Connect'
import type { ExtensionsProviderProps } from './types'

export const ExtensionsProvider = ({
	ss58,
	dappName,
	children,
}: ExtensionsProviderProps) => (
	<ExtensionsConnectProvider>
		<ExtensionAccountsProvider ss58={ss58} dappName={dappName}>
			{children}
		</ExtensionAccountsProvider>
	</ExtensionsConnectProvider>
)
