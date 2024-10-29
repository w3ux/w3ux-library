/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { BigNumber } from "bignumber.js";
import { AnyFunction, AnyJson } from "@w3ux/types";
import { AccountId } from "@polkadot-api/substrate-bindings";

/**
 * @name camelize
 * @summary Converts a string of text to camelCase.
 */
export const camelize = (str: string) => {
  const convertToString = (string: AnyJson) => {
    if (string) {
      if (typeof string === "string") {
        return string;
      }
      return String(string);
    }
    return "";
  };

  const toWords = (inp: string) =>
    convertToString(inp).match(
      /[A-Z\xC0-\xD6\xD8-\xDE]?[a-z\xDF-\xF6\xF8-\xFF]+|[A-Z\xC0-\xD6\xD8-\xDE]+(?![a-z\xDF-\xF6\xF8-\xFF])|\d+/g
    );

  const simpleCamelCase = (inp: string[]) => {
    let result = "";
    for (let i = 0; i < inp?.length; i++) {
      const currString = inp[i];
      let tmpStr = currString.toLowerCase();
      if (i != 0) {
        tmpStr =
          tmpStr.slice(0, 1).toUpperCase() + tmpStr.slice(1, tmpStr.length);
      }
      result += tmpStr;
    }
    return result;
  };

  const w = toWords(str)?.map((a) => a.toLowerCase());
  return simpleCamelCase(w);
};

/**
 * @name ellipsisFn
 * @summary Receives an address and creates ellipsis on the given string, based on parameters.
 * @param str  - The string to apply the ellipsis on
 * @param amount  - The amount of characters that the ellipsis will be
 * @param position - where the ellipsis will apply; if center the amount of character is the
 * same for beginning and end; if "start" or "end" then its only once the amount; defaults to "start"
 */
export const ellipsisFn = (
  str: string,
  amount = 6,
  position: "start" | "end" | "center" = "center"
) => {
  const half = str.length / 2;

  // having an amount less than 4 is a bit extreme so we default there
  if (amount <= 4) {
    if (position === "center") {
      return str.slice(0, 4) + "..." + str.slice(-4);
    }
    if (position === "end") {
      return str.slice(0, 4) + "...";
    }
    return "..." + str.slice(-4);
  }
  // if the amount requested is in a "logical" amount - meaning that it can display the address
  // without repeating the same information twice - then go for it;
  if (position === "center") {
    return amount >= (str.length - 2) / 2
      ? str.slice(0, half - 3) + "..." + str.slice(-(half - 3))
      : str.slice(0, amount) + "..." + str.slice(-amount);
  }
  // else, the user has been mistaskenly extreme, so just show the maximum possible amount
  if (amount >= str.length) {
    if (position === "end") {
      return str.slice(0, str.length - 3) + "...";
    }
    return "..." + str.slice(-(str.length - 3));
  } else {
    if (position === "end") {
      return str.slice(0, amount) + "...";
    }
    return "..." + str.slice(amount);
  }
};

/**
 * @name greaterThanZero
 * @summary Returns whether a BigNumber is greater than zero.
 */
export const greaterThanZero = (val: BigNumber) => val.isGreaterThan(0);

/**
 * @name isNotZero
 * @summary Returns whether a BigNumber is zero.
 */
export const isNotZero = (val: BigNumber) => !val.isZero();

/**
 * @name minDecimalPlaces
 * @summary Forces a number to have at least the provided decimal places.
 */
export const minDecimalPlaces = (val: string, minDecimals: number): string => {
  const whole = new BigNumber(rmCommas(val).split(".")[0] || 0);
  const decimals = val.split(".")[1] || "";
  const missingDecimals = new BigNumber(minDecimals).minus(decimals.length);
  return missingDecimals.isGreaterThan(0)
    ? `${whole.toFormat(0)}.${decimals.toString()}${"0".repeat(
        missingDecimals.toNumber()
      )}`
    : val;
};

/**
 * @name pageFromUri
 * @summary Use url variables to load the default components upon the first page visit.
 */
export const pageFromUri = (pathname: string, fallback: string) => {
  const lastUriItem = pathname.substring(pathname.lastIndexOf("/") + 1);
  const page = lastUriItem.trim() === "" ? fallback : lastUriItem;
  return page.trim();
};

/**
 * @name rmCommas
 * @summary Removes the commas from a string.
 */
export const rmCommas = (val: string): string => val.replace(/,/g, "");

/**
 * @name shuffle
 * @summary Shuffle a set of objects.
 */
export const shuffle = <T>(array: T[]) => {
  let currentIndex = array.length;
  let randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
};

/**
 * @name withTimeout
 * @summary Timeout a promise after a specified number of milliseconds.
 */
export const withTimeout = (
  ms: number,
  promise: AnyFunction,
  options?: {
    onTimeout?: AnyFunction;
  }
) => {
  const timeout = new Promise((resolve) =>
    setTimeout(async () => {
      if (typeof options?.onTimeout === "function") {
        options.onTimeout();
      }
      resolve(undefined);
    }, ms)
  );
  return Promise.race([promise, timeout]);
};

/**
 * @name appendOrEmpty
 * @summary Returns ` value` if a condition is truthy, or an empty string otherwise.
 */
export const appendOrEmpty = (
  condition: boolean | string | undefined,
  value: string
) => (condition ? ` ${value}` : "");

/**
 * @name appendOr
 * @summary Returns ` value` if condition is truthy, or ` fallback` otherwise.
 */
export const appendOr = (
  condition: boolean | string | undefined,
  value: string,
  fallback: string
) => (condition ? ` ${value}` : ` ${fallback}`);

/**
 * @name formatAccountSs58
 * @summary Formats an address with the supplied ss58 prefix, or returns null if invalid.
 */
export const formatAccountSs58 = (
  address: string,
  ss58Prefix: number
): string | null => {
  try {
    const codec = AccountId(ss58Prefix);
    return codec.dec(codec.enc(address));
  } catch (e) {
    return null;
  }
};

/**
 * @name removeHexPrefix
 * @summary Takes a string str as input and returns a new string with the "0x" prefix removed if it
 * exists at the beginning of the input string.
 */
export const removeHexPrefix = (str: string): string => str.replace(/^0x/, "");

// Check if 2 sets contain the same elements.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const eqSet = (xs: Set<any>, ys: Set<any>) =>
  xs.size === ys.size && [...xs].every((x) => ys.has(x));

// Check if one set contains all the elements of another set.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isSuperset = (set: Set<any>, subset: Set<any>) => {
  for (const elem of subset) {
    if (!set.has(elem)) {
      return false;
    }
  }
  return true;
};
