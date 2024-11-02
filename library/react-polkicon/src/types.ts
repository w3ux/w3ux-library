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

export interface PolkiconProps {
  address: string;
  inactive?: boolean;
  outerColor?: string;
  transform?: TransformProp;
}

export type TransformProp =
  | "grow-1"
  | "grow-2"
  | "grow-3"
  | "grow-4"
  | "grow-5"
  | "grow-6"
  | "grow-7"
  | "grow-8"
  | "grow-9"
  | "grow-10"
  | "shrink-1"
  | "shrink-2"
  | "shrink-3"
  | "shrink-4"
  | "shrink-5"
  | "shrink-6"
  | "shrink-7"
  | "shrink-8"
  | "shrink-9"
  | "shrink-10";
