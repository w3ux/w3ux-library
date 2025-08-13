/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

export interface UseTimeleftProps {
	// Dependencies to trigger re-calculation of timeleft.
	depsTimeleft: unknown[]
	// Dependencies to trigger re-render of timeleft, e.g. if language switching occurs.
	depsFormat: unknown[]
}

export interface TimeleftDuration {
	days: number
	hours: number
	minutes: number
	seconds: number
	lastMinute: boolean
}

export interface TimeLeftRaw {
	days: number
	hours: number
	minutes: number
	seconds?: number
}

export interface TimeLeftFormatted {
	days: [number, string]
	hours: [number, string]
	minutes: [number, string]
	seconds?: [number, string]
}

export interface TimeLeftAll {
	raw: TimeLeftRaw
}

export interface TimeleftHookProps {
	refreshInterval: number
}
