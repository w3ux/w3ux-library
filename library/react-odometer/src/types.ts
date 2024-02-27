/* @license Copyright 2024 @polkadot-cloud/library authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { MutableRefObject } from "react";

export interface Props {
  value: number | string;
  wholeColor?: string;
  decimalColor?: string;
  spaceBefore?: string | number;
  spaceAfter?: string | number;
  zeroDecimals?: number;
}

export type Digit =
  | "comma"
  | "dot"
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9";

export type DigitRef = MutableRefObject<HTMLSpanElement>;

export type Status = "new" | "inactive" | "transition" | "finished";

export type Direction = "down" | "none";
