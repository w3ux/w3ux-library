/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

// Metadata of a Polkicon cirlce.
export interface Circle {
  cx: number;
  cy: number;
  fill: string;
  r: number;
}

// Metadata of a Polkicon scheme.
export interface Scheme {
  freq: number;
  colors: number[];
}

// A Polkicon shape coordinate.
export type Coordinate = [number, number];
