/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { CSSProperties, ReactNode } from "react";

// An optional string.
export type MaybeString = string | null | undefined;

// A hex string
export type HexString = `0x${string}`;

// A general purpose sync status, tracking whether an item is not synced, in progress, or completed
// syncing. Useful for tracking async function progress, used as React refs, etc.
export type Sync = "synced" | "unsynced" | "syncing";

// A general purpose medium components are being displayed on.
export type DisplayFor = "default" | "modal" | "canvas" | "card";

// A generic type for basic React components. We assume the component may have children and styling
// applied to it.
export interface ComponentBase {
  // passing react children.
  children?: ReactNode;
  // passing custom styling.
  style?: CSSProperties;
}

// An extension of the ComponentBase type with an additional className property.
export type ComponentBaseWithClassName = ComponentBase & {
  // passing a className string.
  className?: string;
};

// A funtion with no arguments and no return value.
export type VoidFn = () => void;

// A JSON value: string, number, object, array, true, false, null.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyJson = any;

// A function definition.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFunction = any;
