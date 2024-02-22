/* @license Copyright 2024 @polkadot-cloud/library authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { CSSProperties, FC } from "react";

// Structure for an extension configuration.
export interface ExtensionConfig {
  title: string;
  website: string | [string, string];
  features: "*" | ExtensionFeature[];
}

// Supported extension features.
export type ExtensionFeature = "getAccounts" | "subscribeAccounts" | "signer";

// Structure for a hardware wallet configuration.
export interface HardwareConfig {
  title: string;
  website: string | [string, string];
}

// Icon record structure.
export type ExtensionIconRecords = Record<string, ExtensionIcon>;

export type ExtensionIcon = FC<{
  style?: CSSProperties;
  className?: string;
}>;

// Global types.
declare global {
  interface Window {
    // Nova Wallet will have this window property.
    // eslint-disable-next-line
    walletExtension?: any;
  }
}
