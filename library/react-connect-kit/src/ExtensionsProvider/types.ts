/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { FunctionComponent, SVGProps } from "react";
import { AnyJson, ExternalAccountAddedBy, VoidFn } from "../types";

// Extensions context interface.
export interface ExtensionsContextInterface {
  checkingInjectedWeb3: boolean;
  extensionsStatus: Record<string, ExtensionStatus>;
  setExtensionStatus: (id: string, status: ExtensionStatus) => void;
  removeExtensionStatus: (id: string) => void;
  extensionInstalled: (id: string) => boolean;
  extensionCanConnect: (id: string) => boolean;
  extensionHasFeature: (id: string, feature: string) => boolean;
  setSnapsEnabled: (enabled: boolean) => void;
  snapsEnabled: boolean;
}

// Top level required properties the extension must expose via their `injectedWeb3` entry.
export interface ExtensionInjected extends ExtensionConfig {
  id: string;
  enable: (n: string) => Promise<ExtensionInterface>;
}

// Required properties `enable` must provide after resolution.
export interface ExtensionInterface {
  accounts: {
    subscribe: (a: (b: ExtensionAccount[]) => void) => VoidFn;
    get: () => Promise<ExtensionAccount[]>;
  };
  provider: AnyJson;
  metadata: AnyJson;
  signer: AnyJson;
}

// Required properties returned after subscribing to accounts.
export interface ExtensionAccount extends ExtensionMetadata {
  address: string;
  meta?: AnyJson;
  name: string;
  signer?: AnyJson;
}

// Configuration item of an extension.
export interface ExtensionConfig {
  id: string;
  title: string;
  icon: FunctionComponent<
    SVGProps<SVGSVGElement> & { title?: string | undefined }
  >;
  url: string;
}

// Miscellaneous metadata added to an extension.
export interface ExtensionMetadata {
  addedBy?: ExternalAccountAddedBy;
  source: string;
}

export type ExtensionStatus = "installed" | "not_authenticated" | "connected";
