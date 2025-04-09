/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { connectExtensions, getActiveExtensionsLocal } from '../extensions'
import {
  addUnsub,
  getAccountsFromExtensions,
  processExtensionAccounts,
  setReconnectSync,
  updateAccounts,
} from './index'

export const reconnectExtensions = async (dappName: string, ss58: number) => {
  setReconnectSync('syncing')
  const { connected } = await connectExtensions(
    dappName,
    getActiveExtensionsLocal()
  )
  if (connected.size > 0) {
    // Perform initial account state update
    updateAccounts({
      add: await getAccountsFromExtensions(connected, ss58),
      remove: [],
    })

    // If availahle, subscribe to accounts for each connected extension
    for (const [id, { extension }] of Array.from(connected.entries())) {
      if (typeof extension.accounts.subscribe === 'function') {
        const unsub = extension.accounts.subscribe((accounts) => {
          processExtensionAccounts(
            {
              source: id,
              ss58,
            },
            extension.signer,
            accounts
          )
        })
        addUnsub(id, unsub)
      }
    }
  }
  setReconnectSync('synced')
}
