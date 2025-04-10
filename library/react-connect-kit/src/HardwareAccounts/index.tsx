/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { createSafeContext } from '@w3ux/hooks'
import type { HardwareAccount, HardwareAccountSource } from '@w3ux/types'
import { ellipsisFn } from '@w3ux/utils'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { hardwareAccountsKey } from '../consts'
import type { HardwareAccountsContextInterface } from './types'
import { getLocalHardwareAccounts } from './utils'

export const [HardwareAccountsContext, useHardwareAccounts] =
  createSafeContext<HardwareAccountsContextInterface>()

export const HardwareAccountsProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  // Store imported hardware accounts
  const [hardwareAccounts, setHardwareAccounts] = useState<HardwareAccount[]>(
    getLocalHardwareAccounts()
  )

  // Check if an account exists
  const hardwareAccountExists = (
    source: HardwareAccountSource,
    network: string,
    address: string
  ) =>
    !!hardwareAccounts.find(
      (a) =>
        a.source === source && a.address === address && a.network === network
    )

  // Adds an account
  const addHardwareAccount = (
    source: HardwareAccountSource,
    network: string,
    address: string,
    index: number,
    callback?: () => void
  ) => {
    const exists = !!hardwareAccounts.find(
      (a) =>
        a.source === source && a.address === address && a.network === network
    )

    if (!exists) {
      const newAccount: HardwareAccount = {
        address,
        network,
        name: ellipsisFn(address),
        source,
        index,
      }
      const newHardwareAccounts = [...hardwareAccounts].concat(newAccount)
      localStorage.setItem(
        hardwareAccountsKey,
        JSON.stringify(newHardwareAccounts)
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
    callback?: () => void
  ) => {
    const newHardwareAccounts = [...hardwareAccounts].filter(
      (a) =>
        !(a.source === source && a.address === address && a.network === network)
    )

    if (!newHardwareAccounts.length) {
      localStorage.removeItem(hardwareAccountsKey)
    } else {
      localStorage.setItem(
        hardwareAccountsKey,
        JSON.stringify(newHardwareAccounts)
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
    newName: string
  ) => {
    const newHardwareAccounts = [...hardwareAccounts].map((a) =>
      a.source === source && a.network === network && a.address === address
        ? {
            ...a,
            name: newName,
          }
        : a
    )
    localStorage.setItem(
      hardwareAccountsKey,
      JSON.stringify(newHardwareAccounts)
    )
    setHardwareAccounts(newHardwareAccounts)
  }

  // Gets an imported account
  const getHardwareAccount = (
    source: HardwareAccountSource,
    network: string,
    address: string
  ) =>
    hardwareAccounts.find(
      (a) =>
        a.source === source && a.network === network && a.address === address
    ) || null

  // Gets all accounts for a network and source
  const getHardwareAccounts = (
    source: HardwareAccountSource,
    network: string
  ) =>
    hardwareAccounts.filter((a) => a.source === source && a.network === network)

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
