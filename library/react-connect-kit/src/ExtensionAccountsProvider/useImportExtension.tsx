/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import Keyring from "@polkadot/keyring";
import { isValidAddress } from "@w3ux/utils";
import type { ExtensionAccount } from "../ExtensionsProvider/types";
import { HandleImportExtension, NetworkSS58 } from "./types";
import { getActiveAccountLocal, getInExternalAccounts } from "./utils";
import { defaultHandleImportExtension } from "./defaults";
import { AnyFunction } from "../types";

export const useImportExtension = () => {
  // Handles importing of extension accounts.
  //
  // Gets accounts to be imported and commits them to state.
  const handleImportExtension = (
    id: string,
    currentAccounts: ExtensionAccount[],
    signer: AnyFunction,
    newAccounts: ExtensionAccount[],
    { network, ss58 }: NetworkSS58
  ): HandleImportExtension => {
    if (!newAccounts.length) {
      return defaultHandleImportExtension;
    }

    const keyring = new Keyring();
    keyring.setSS58Format(ss58);

    // Remove accounts that do not contain correctly formatted addresses.
    newAccounts = newAccounts.filter(({ address }) => isValidAddress(address));

    // Reformat addresses to ensure correct ss58 format.
    newAccounts.map((account) => {
      const { address } = keyring.addFromAddress(account.address);
      account.address = address;
      return account;
    });

    // Remove `newAccounts` from local external accounts if present.
    const inExternal = getInExternalAccounts(newAccounts, network);

    // Find any accounts that have been removed from this extension.
    const removedAccounts = currentAccounts
      .filter((j) => j.source === id)
      .filter((j) => !newAccounts.find((i) => i.address === j.address));

    // Check whether active account is present in forgotten accounts.
    const removedActiveAccount =
      removedAccounts.find(
        ({ address }) => address === getActiveAccountLocal(network, ss58)
      )?.address || null;

    // Remove accounts that have already been added to `currentAccounts` via another extension.
    newAccounts = newAccounts.filter(
      ({ address }) =>
        !currentAccounts.find(
          (j) => j.address === address && j.source !== "external"
        )
    );

    // Format accounts properties.
    newAccounts = newAccounts.map(({ address, name }) => ({
      address,
      name,
      source: id,
      signer,
    }));

    return {
      newAccounts,
      meta: {
        accountsToRemove: [...inExternal, ...removedAccounts],
        removedActiveAccount,
      },
    };
  };

  return {
    handleImportExtension,
  };
};
