/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { ExtensionAccount } from '@w3ux/types'
import { addUnsub } from '../accounts/unsubs'
import { processExtensionAccounts } from '../accounts/util'
import { canConnect } from '../util'
import { initExtensions } from './index'

// Connects to a single extension and processes its accounts
export const connectExtension = async (
  dappName: string,
  ss58: number,
  id: string
): Promise<boolean> => {
  if (canConnect(id)) {
    const { connected } = await initExtensions(dappName, [id])
    if (connected.size === 0) {
      return
    }
    const { extension } = connected.get(id)
    const canSubscribe = typeof extension.accounts.subscribe === 'function'

    const handleAccounts = (accounts: ExtensionAccount[]) => {
      processExtensionAccounts(
        {
          source: id,
          ss58,
        },
        extension.signer,
        accounts
      )
    }

    // If account subscriptions are not supported, simply get the account(s) from the extension,
    // otherwise, subscribe to accounts
    if (!canSubscribe) {
      const accounts = await extension.accounts.get()
      handleAccounts(accounts)
    } else {
      const unsub = extension.accounts.subscribe((accounts) => {
        handleAccounts(accounts)
      })
      addUnsub(id, unsub)
    }
    return true
  }
  return false
}
