/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { ForwardedRef, RefObject } from 'react'

// Merge an external ref (callback or RefObject) with an internal ref so both stay in sync
export const mergeRefs = <T extends HTMLElement>(
	el: T | null,
	internalRef: RefObject<HTMLElement | null>,
	externalRef: ForwardedRef<T>,
): void => {
	internalRef.current = el
	if (externalRef) {
		if (typeof externalRef === 'function') {
			externalRef(el)
		} else {
			externalRef.current = el
		}
	}
}
