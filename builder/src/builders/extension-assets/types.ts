/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { CSSProperties, FC } from "react";

// Structure for an extension configuration.
export interface ExtensionConfig {
  title: string;
  category: "web-extension" | "hardware";
  website:
    | string
    | {
        url: string;
        text: string;
      };
  features: "*" | ExtensionFeature[];
}

// Supported extension features.
export type ExtensionFeature = "getAccounts" | "subscribeAccounts" | "signer";

// Icon record structure.
export type ExtensionIconRecords = Record<string, ExtensionIcon>;

export type ExtensionIcon = FC<{
  style?: CSSProperties;
  className?: string;
}>;
