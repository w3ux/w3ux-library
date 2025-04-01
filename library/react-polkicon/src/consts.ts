/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { Scheme } from './types'

// Size of the Polkicon in pixels.
export const PolkiconSize = 64

// Center coordinate of the Polkicon.
export const PolkiconCenter = PolkiconSize / 2

// Radius of a Polkicon circle.
export const CircleRadius = 5

// Schemas for the Polkicon.
export const SCHEMA: Record<string, Scheme> = {
  target: {
    colors: [0, 28, 0, 0, 28, 0, 0, 28, 0, 0, 28, 0, 0, 28, 0, 0, 28, 0, 1],
    freq: 1,
  },
  cube: {
    colors: [0, 1, 3, 2, 4, 3, 0, 1, 3, 2, 4, 3, 0, 1, 3, 2, 4, 3, 5],
    freq: 20,
  },
  quazar: {
    colors: [1, 2, 3, 1, 2, 4, 5, 5, 4, 1, 2, 3, 1, 2, 4, 5, 5, 4, 0],
    freq: 16,
  },
  flower: {
    colors: [0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 3],
    freq: 32,
  },
  cyclic: {
    colors: [0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5, 6],
    freq: 32,
  },
  vmirror: {
    colors: [0, 1, 2, 3, 4, 5, 3, 4, 2, 0, 1, 6, 7, 8, 9, 7, 8, 6, 10],
    freq: 128,
  },
  hmirror: {
    colors: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 8, 6, 7, 5, 3, 4, 2, 11],
    freq: 128,
  },
}
