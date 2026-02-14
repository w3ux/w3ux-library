/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { createSafeContext } from '@w3ux/hooks'
import {
	getHardwareAccountsLocal,
	HardwareAccountsKey,
	hardwareAccounts$,
	setHardwareAccounts,
} from '@w3ux/observables-connect'
import type { HardwareAccount, HardwareAccountSource } from '@w3ux/types'
import { ellipsisFn } from '@w3ux/utils'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import type { HardwareAccountsContextInterface } from './types'

export const [HardwareAccountsContext, useHardwareAccounts] =
	createSafeContext<HardwareAccountsContextInterface>()

export const HardwareAccountsProvider = ({
	children,
}: {
	children: ReactNode
}) => {
	// Store imported hardware accounts
	const [hardwareAccounts, setHardwareAccountsState] = useState<
		HardwareAccount[]
	>(getHardwareAccountsLocal())

	// Check if an account exists
	const hardwareAccountExists = (
		source: HardwareAccountSource,
		network: string,
		address: string,
	) =>
		!!hardwareAccounts.find(
			(a) =>
				a.source === source && a.address === address && a.network === network,
		)

	// Adds an account
	const addHardwareAccount = (
		source: HardwareAccountSource,
		network: string,
		group: number,
		address: string,
		index: number,
		callback?: () => void,
	) => {
		if (!hardwareAccountExists(source, network, address)) {
			const newAccount: HardwareAccount = {
				address,
				network,
				group,
				name: ellipsisFn(address),
				source,
				index,
			}
			const newHardwareAccounts = [...hardwareAccounts].concat(newAccount)
			localStorage.setItem(
				HardwareAccountsKey,
				JSON.stringify(newHardwareAccounts),
			)
			setHardwareAccounts(newHardwareAccounts)
			// Handle optional callback function
			if (typeof callback === 'function') {
				callback()
			}
			return newAccount
		}
		return null
	}

	// Removes an account
	const removeHardwareAccount = (
		source: HardwareAccountSource,
		network: string,
		address: string,
		callback?: () => void,
	) => {
		const newHardwareAccounts = [...hardwareAccounts].filter(
			(a) =>
				!(
					a.source === source &&
					a.address === address &&
					a.network === network
				),
		)

		if (!newHardwareAccounts.length) {
			localStorage.removeItem(HardwareAccountsKey)
		} else {
			localStorage.setItem(
				HardwareAccountsKey,
				JSON.stringify(newHardwareAccounts),
			)
		}
		setHardwareAccounts(newHardwareAccounts)
		// Handle optional callback function
		if (typeof callback === 'function') {
			callback()
		}
	}

	// Renames an imported account
	const renameHardwareAccount = (
		source: HardwareAccountSource,
		network: string,
		address: string,
		newName: string,
	) => {
		const newHardwareAccounts = [...hardwareAccounts].map((a) =>
			a.source === source && a.network === network && a.address === address
				? {
						...a,
						name: newName,
					}
				: a,
		)
		localStorage.setItem(
			HardwareAccountsKey,
			JSON.stringify(newHardwareAccounts),
		)
		setHardwareAccounts(newHardwareAccounts)
	}

	// Gets an imported account
	const getHardwareAccount = (
		source: HardwareAccountSource,
		network: string,
		address: string,
	) =>
		hardwareAccounts.find(
			(a) =>
				a.source === source && a.network === network && a.address === address,
		) || null

	// Gets all accounts for a network and source
	const getHardwareAccounts = (
		source: HardwareAccountSource,
		network: string,
	) =>
		hardwareAccounts.filter((a) => a.source === source && a.network === network)

	// Subscribes to observables and updates state
	useEffect(() => {
		const sub = hardwareAccounts$.subscribe((accounts) => {
			setHardwareAccountsState(accounts)
		})
		return () => {
			sub.unsubscribe()
		}
	}, [])

	return (
		<HardwareAccountsContext.Provider
			value={{
				hardwareAccountExists,
				getHardwareAccount,
				addHardwareAccount,
				removeHardwareAccount,
				renameHardwareAccount,
				getHardwareAccounts,
			}}
		>
			{children}
		</HardwareAccountsContext.Provider>
	)
}
