/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import _qrcode from 'qrcode-generator'

const qrcode: typeof _qrcode = _qrcode

// biome-ignore lint/suspicious/noExplicitAny: <workaround for qrcode-generator types>
;(qrcode as any).stringToBytes = (data: Uint8Array): Uint8Array => data

export { qrcode }
