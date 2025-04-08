// /* @license Copyright 2024 w3ux authors & contributors
// SPDX-License-Identifier: GPL-3.0-only */

// import type {
//   ExtensionAccount,
//   ExtensionEnableResults,
//   HandleImportExtension,
//   ImportedAccount,
// } from '@w3ux/types'
// import { formatAccountSs58, isValidAddress } from '@w3ux/utils'
// import { DefaultHandleImportExtension, DefaultSS58 } from '../consts'
// import { getActiveAccountLocal, getLocalExternalAccounts } from './local'

// // Connects to the provided extensions and fetches their accounts
// export const getAccountsFromExtensions = async (
//   extensions: ExtensionEnableResults
// ): Promise<ExtensionAccount[]> => {
//   try {
//     const results = await Promise.allSettled(
//       Array.from(extensions.values()).map(({ extension }) =>
//         extension.accounts.get()
//       )
//     )
//     const extensionEntries = Array.from(extensions.entries())
//     const accounts: ExtensionAccount[] = []

//     for (let i = 0; i < results.length; i++) {
//       const result = results[i]
//       const source = extensionEntries[i][0]
//       const signer = extensionEntries[i][1].extension.signer

//       if (result.status === 'fulfilled') {
//         const filtered = result.value
//           // Reformat addresses with default ss58 prefix
//           .map((account) => {
//             const address = formatAccountSs58(account.address, DefaultSS58)
//             if (!address) {
//               return null
//             }
//             return {
//               ...account,
//               address,
//             }
//           })
//           // Remove null entries resulting from invalid formatted addresses
//           .filter((a) => a !== null)
//           // Remove accounts that have already been imported
//           .filter(({ address }) => !accounts.find((a) => address === a.address))
//           // Reformat entries to include extension source
//           .map(({ address, name }) => ({
//             address,
//             name,
//             source,
//             signer,
//           }))

//         accounts.push(...filtered)
//       }
//     }
//     return accounts
//   } catch (e) {
//     console.error('Error during enable and format call: ', e)
//     return []
//   }
// }

// // Gets accounts to be imported and commits them to state.
// export const handleExtensionAccountsUdpdate = (
//   id: string,
//   currentAccounts: ExtensionAccount[],
//   signer: unknown,
//   accounts: ExtensionAccount[],
//   network: string,
//   ss58: number
// ): HandleImportExtension => {
//   if (!accounts.length) {
//     return DefaultHandleImportExtension
//   }

//   accounts = accounts
//     // Remove accounts that do not contain correctly formatted addresses
//     .filter(({ address }) => isValidAddress(address))
//     // Reformat addresses to ensure default ss58 format
//     .map((account) => {
//       const formattedAddress = formatAccountSs58(account.address, ss58)
//       if (!formattedAddress) {
//         return null
//       }
//       account.address = formattedAddress
//       return account
//     })
//     // Remove null entries resulting from invalid formatted addresses
//     .filter((account) => account !== null)

//   // Remove accounts from local external accounts if present
//   const inExternal = getInExternalAccounts(accounts, network)

//   // Find any accounts that have been removed from this extension
//   const removedAccounts = currentAccounts
//     .filter((j) => j.source === id)
//     .filter((j) => !accounts.find((i) => i.address === j.address))

//   // Check whether active account is present in forgotten accounts
//   const removedActiveAccount =
//     removedAccounts.find(
//       ({ address }) => address === getActiveAccountLocal(network, ss58)
//     )?.address || null

//   // Remove accounts that have already been added to `currentAccounts` via another extension
//   accounts = accounts.filter(
//     ({ address }) =>
//       !currentAccounts.find(
//         (j) => j.address === address && j.source !== 'external'
//       )
//   )

//   // Format accounts properties
//   accounts = accounts.map(({ address, name }) => ({
//     address,
//     name,
//     source: id,
//     signer,
//   }))

//   return {
//     newAccounts: accounts,
//     meta: {
//       accountsToRemove: [...inExternal, ...removedAccounts],
//       removedActiveAccount,
//     },
//   }
// }

// // Gets accounts that exist in local external accounts
// export const getInExternalAccounts = (
//   accounts: ImportedAccount[],
//   network: string
// ) => {
//   const localExternalAccounts = getLocalExternalAccounts(network)
//   return (
//     localExternalAccounts.filter(
//       (a) => (accounts || []).find((b) => b.address === a.address) !== undefined
//     ) || []
//   )
// }
