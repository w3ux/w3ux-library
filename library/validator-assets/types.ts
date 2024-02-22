/* @license Copyright 2024 @polkadot-cloud/library authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

// The supported chains for validators.
export type ValidatorSupportedChains = "polkadot" | "kusama" | "westend";

// Structure for a validator entity.
export interface ValidatorEntry {
  name: string;
  thumbnail: string;
  bio: string;
  email?: string;
  twitter?: string;
  website?: string;
  // Must have at least one active validator on at least one network.
  validators: Partial<Record<ValidatorSupportedChains, string[]>>;
}
