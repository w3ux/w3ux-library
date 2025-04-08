// /* @license Copyright 2024 w3ux authors & contributors
// SPDX-License-Identifier: GPL-3.0-only */

// import type { ExternalAccount } from '@w3ux/types'
// import { formatAccountSs58, localStorageOrDefault } from '@w3ux/utils'

// // Gets local active account for a network
// export const getActiveAccountLocal = (
//   network: string,
//   ss58: number
// ): string | null => {
//   const account = localStorageOrDefault(`${network}_active_account`, null)
//   if (account !== null) {
//     const formattedAddress = formatAccountSs58(account, ss58)
//     if (formattedAddress) {
//       return formattedAddress
//     }
//   }
//   return null
// }

// // Gets local external accounts for a network
// export const getLocalExternalAccounts = (network?: string) => {
//   let localAccounts = localStorageOrDefault<ExternalAccount[]>(
//     'external_accounts',
//     [],
//     true
//   ) as ExternalAccount[]
//   if (network) {
//     localAccounts = localAccounts.filter((l) => l.network === network)
//   }
//   return localAccounts
// }
