/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { RefObject } from 'react'

export interface Props {
	value: number | string
	wholeColor?: string
	decimalColor?: string
	spaceBefore?: string | number
	spaceAfter?: string | number
	zeroDecimals?: number
}

export type Digit =
	| 'comma'
	| 'dot'
	| '0'
	| '1'
	| '2'
	| '3'
	| '4'
	| '5'
	| '6'
	| '7'
	| '8'
	| '9'

export type DigitRef = RefObject<HTMLSpanElement>

export type Status = 'new' | 'inactive' | 'transition' | 'finished'

export type Direction = 'down' | 'none'
