/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { inject, isMimirReady, MIMIR_REGEXP } from '@mimirdev/apps-inject'

export const injectMimir = async () => {
	const openInIframe = window !== window.parent
	// Return if not opened in an iframe
	if (!openInIframe) {
		return
	}
	const origin = await isMimirReady()
	// Return if not opened in Mimir
	if (!origin) {
		return
	}
	if (MIMIR_REGEXP.test(origin)) {
		inject()
	}
}
