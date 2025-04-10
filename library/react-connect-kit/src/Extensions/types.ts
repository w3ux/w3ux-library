/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { ExtensionStatus } from '@w3ux/types'

export interface ExtensionsContextInterface {
  gettingExtensions: boolean
  extensionsStatus: Record<string, ExtensionStatus>
  setExtensionStatus: (id: string, status: ExtensionStatus) => void
  removeExtensionStatus: (id: string) => void
  extensionInstalled: (id: string) => boolean
  extensionCanConnect: (id: string) => boolean
}
