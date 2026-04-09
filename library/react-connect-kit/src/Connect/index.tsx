/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { ExtensionsProvider } from '../Extensions/Provider'
import { HardwareAccountsProvider } from '../Hardware'
import type { ConnectProviderProps } from './types'

export const ConnectProvider = ({
	children,
	ss58,
	dappName,
	adaptors = [],
}: ConnectProviderProps) => {
	// Compose adaptor providers around children, innermost first
	const wrapped = adaptors.reduceRight(
		(acc, Adaptor, i) => <Adaptor key={i}>{acc}</Adaptor>,
		children,
	)

	return (
		<ExtensionsProvider ss58={ss58} dappName={dappName}>
			<HardwareAccountsProvider>{wrapped}</HardwareAccountsProvider>
		</ExtensionsProvider>
	)
}
