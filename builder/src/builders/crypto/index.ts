/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { simpleBuild } from 'builders/common/simpleBuild'

export const build = async () => {
  await simpleBuild('crypto')
}
