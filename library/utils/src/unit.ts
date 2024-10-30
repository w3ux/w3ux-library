/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { u8aToString, u8aUnwrapBytes } from "@polkadot/util";
import { BigNumber } from "bignumber.js";
import type { MutableRefObject, RefObject } from "react";
import { AnyObject } from "./types";
import { ellipsisFn, rmCommas } from "./base";
import { AnyJson } from "@w3ux/types";
import { AccountId } from "@polkadot-api/substrate-bindings";

/**
 * @name remToUnit
 * @summary Converts a rem string to a number.
 */
export const remToUnit = (rem: string) =>
  Number(rem.slice(0, rem.length - 3)) *
  parseFloat(getComputedStyle(document.documentElement).fontSize);

/**
 * @name planckToUnit
 * @summary convert planck to the token unit.
 * @description
 * Converts an on chain balance value in BigNumber planck to a decimal value in token unit. (1 token
 * = 10^units planck).
 */
export const planckToUnit = (val: BigNumber, units: number) =>
  new BigNumber(
    val.dividedBy(new BigNumber(10).exponentiatedBy(units)).toFixed(units)
  );

/**
 * @name unitToPlanck
 * @summary Convert the token unit to planck.
 * @description
 * Converts a balance in token unit to an equivalent value in planck by applying the chain decimals
 * point. (1 token = 10^units planck).
 */
export const unitToPlanck = (val: string, units: number): BigNumber => {
  const init = new BigNumber(!val.length || !val ? "0" : val);
  return (!init.isNaN() ? init : new BigNumber(0))
    .multipliedBy(new BigNumber(10).exponentiatedBy(units))
    .integerValue();
};

/**
 * @name capitalizeFirstLetter
 * @summary Capitalize the first letter of a string.
 */
export const capitalizeFirstLetter = (string: string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

/**
 * @name snakeToCamel
 * @summary converts a string from snake / kebab-case to camel-case.
 */
export const snakeToCamel = (str: string) =>
  str
    .toLowerCase()
    .replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase().replace("-", "").replace("_", "")
    );

/**
 * @name setStateWithRef
 * @summary Synchronize React state and its reference with the provided value.
 */
export const setStateWithRef = <T>(
  value: T,
  setState: (_state: T) => void,
  ref: MutableRefObject<T>
): void => {
  setState(value);
  ref.current = value;
};

/**
 * @name localStorageOrDefault
 * @summary Retrieve the local stroage value with the key, return defult value if it is not
 * found.
 */
export const localStorageOrDefault = <T>(
  key: string,
  _default: T,
  parse = false
): T | string => {
  const val: string | null = localStorage.getItem(key);

  if (val === null) {
    return _default;
  }

  if (parse) {
    return JSON.parse(val) as T;
  }
  return val;
};

/**
 * @name isValidAddress
 * @summary Return whether an address is valid Substrate address.
 */
export const isValidAddress = (address: string): boolean => {
  try {
    const codec = AccountId();
    codec.dec(codec.enc(address));
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * @name determinePoolDisplay
 * @summary A pool will be displayed with either its set metadata or its address.
 */
export const determinePoolDisplay = (address: string, batchItem: AnyJson) => {
  // default display value
  const defaultDisplay = ellipsisFn(address, 6);

  // fallback to address on empty metadata string
  let display = batchItem ?? defaultDisplay;

  // check if super identity has been byte encoded
  const displayAsBytes = u8aToString(u8aUnwrapBytes(display));
  if (displayAsBytes !== "") {
    display = displayAsBytes;
  }
  // if still empty string, default to clipped address
  if (display === "") {
    display = defaultDisplay;
  }

  return display;
};

/**
 * @name extractUrlValue
 * @summary Extracts a URL value from a URL string.
 */
export const extractUrlValue = (key: string, url?: string) => {
  if (typeof url === "undefined") {
    url = window.location.href;
  }
  const match = url.match(`[?&]${key}=([^&]+)`);
  return match ? match[1] : null;
};

/**
 * @name varToUrlHash
 * @summary Puts a variable into the URL hash as a param.
 * @description
 * Since url variables are added to the hash and are not treated as URL params, the params are split
 * and parsed into a `URLSearchParams`.
 */
export const varToUrlHash = (
  key: string,
  val: string,
  addIfMissing: boolean
) => {
  const hash = window.location.hash;
  const [page, params] = hash.split("?");
  const searchParams = new URLSearchParams(params);

  if (searchParams.get(key) === null && !addIfMissing) {
    return;
  }
  searchParams.set(key, val);
  window.location.hash = `${page}?${searchParams.toString()}`;
};

/**
 * @name removeVarFromUrlHash
 * @summary
 * Removes a variable `key` from the URL hash if it exists. Removes dangling `?` if no URL variables
 * exist.
 */
export const removeVarFromUrlHash = (key: string) => {
  const hash = window.location.hash;
  const [page, params] = hash.split("?");
  const searchParams = new URLSearchParams(params);
  if (searchParams.get(key) === null) {
    return;
  }
  searchParams.delete(key);
  const paramsAsStr = searchParams.toString();
  window.location.hash = `${page}${paramsAsStr ? `?${paramsAsStr}` : ``}`;
};

/**
 * @name sortWithNull
 * @summary Sorts an array with nulls last.
 */
export const sortWithNull =
  (ascending: boolean) => (a: AnyJson, b: AnyJson) => {
    // equal items sort equally
    if (a === b) {
      return 0;
    }
    // nulls sort after anything else
    if (a === null) {
      return 1;
    }
    if (b === null) {
      return -1;
    }
    // otherwise, if we're ascending, lowest sorts first
    if (ascending) {
      return a < b ? -1 : 1;
    }
    // if descending, highest sorts first
    return a < b ? 1 : -1;
  };

/**
 * @name applyWidthAsPadding
 * @summary Applies width of subject to paddingRight of container.
 */
export const applyWidthAsPadding = (
  subjectRef: RefObject<HTMLDivElement>,
  containerRef: RefObject<HTMLDivElement>
) => {
  if (containerRef.current && subjectRef.current) {
    containerRef.current.style.paddingRight = `${
      subjectRef.current.offsetWidth + remToUnit("1rem")
    }px`;
  }
};

/**
 * @name unescape
 * @summary Replaces \” with “
 */
export const unescape = (val: string) => val.replace(/\\"/g, '"');

/**
 * @name inChrome
 * @summary Whether the application is rendering in Chrome.
 */
export const inChrome = () => {
  const isChromium = (window as AnyJson)?.chrome || null;
  const winNav = (window as AnyJson)?.navigator || null;
  const isOpera = typeof (window as AnyJson)?.opr !== "undefined";
  const isIEedge = winNav?.userAgent.indexOf("Edg") > -1 || false;
  const isIOSChrome = winNav?.userAgent.match("CriOS") || false;

  if (isIOSChrome) {
    return true;
  }
  if (
    isChromium !== null &&
    typeof isChromium !== "undefined" &&
    isOpera === false &&
    isIEedge === false
  ) {
    return true;
  }
  return false;
};

/**
 * @name addedTo
 * @summary Given 2 objects and some keys, return items in the fresh object that do not exist in the
 * stale object by matching the given common key values of both objects.
 */
export const addedTo = (
  fresh: AnyObject[],
  stale: AnyObject[],
  keys: string[]
): AnyObject[] =>
  typeof fresh !== "object" || typeof stale !== "object" || !keys.length
    ? []
    : fresh.filter(
        (freshItem) =>
          !stale.find((staleItem) =>
            keys.every((key) =>
              !(key in staleItem) || !(key in freshItem)
                ? false
                : staleItem[key] === freshItem[key]
            )
          )
      );

/**
 * @name removedFrom
 * @summary Given 2 objects and some keys, return items in the stale object that do not exist in the
 * fresh object by matching the given common key values of both objects.
 */
export const removedFrom = (
  fresh: AnyObject[],
  stale: AnyObject[],
  keys: string[]
): AnyObject[] =>
  typeof fresh !== "object" || typeof stale !== "object" || !keys.length
    ? []
    : stale.filter(
        (staleItem) =>
          !fresh.find((freshItem) =>
            keys.every((key) =>
              !(key in staleItem) || !(key in freshItem)
                ? false
                : freshItem[key] === staleItem[key]
            )
          )
      );

/**
 * @name matchedProperties
 * @summary Given 2 objects and some keys, return items in object 1 that also exist in object 2 by
 * matching the given common key values of both objects.
 */
export const matchedProperties = (
  objX: AnyObject[],
  objY: AnyObject[],
  keys: string[]
): AnyObject[] =>
  typeof objX !== "object" || typeof objY !== "object" || !keys.length
    ? []
    : objY.filter((x) =>
        objX.find((y) =>
          keys.every((key) =>
            !(key in x) || !(key in y) ? false : y[key] === x[key]
          )
        )
      );

/**
 * @name isValidHttpUrl
 * @summary Give a string, return whether it is a valid http URL.
 * @param string  - The string to check.
 */
export const isValidHttpUrl = (string: string) => {
  let url: URL;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
};

/**
 * @name makeCancelable
 * @summary Makes a promise cancellable.
 * @param promise  - The promise to make cancellable.
 */
export const makeCancelable = (promise: Promise<AnyObject>) => {
  let hasCanceled = false;

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then((val) =>
      hasCanceled ? reject(Error("Cancelled")) : resolve(val)
    );
    promise.catch((error) =>
      hasCanceled ? reject(Error("Cancelled")) : reject(error)
    );
  });

  return {
    promise: wrappedPromise,
    cancel: () => {
      hasCanceled = true;
    },
  };
};

/**
 * The transformToBaseUnit function is used to transform a given estimated
 * fee value from its current representation to its base unit representation,
 * considering the provided chain decimals. The function is designed to handle
 * cases where the chain decimals are either greater or less than the length
 * of the estimated fee.
 * @param {string} estFee : The estimated fee value that needs to be transformed
 * to its base unit representation.
 * @param {number} chainDecimals: The number of decimal places used by the blockchain.
 */
export const transformToBaseUnit = (
  estFee: string,
  chainDecimals: number
): string => {
  const t = estFee.length - chainDecimals;
  let s = "";
  // if chainDecimals are more than the estFee length
  if (t < 0) {
    // add 0 in front (1 less as we want the 0.)
    for (let i = 0; i < Math.abs(t) - 1; i++) {
      s += "0";
    }
    s = s + estFee;
    // remove trailing 0s
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < s.length; i++) {
      if (s.slice(s.length - 1) !== "0") {
        break;
      }
      s = s.substring(0, s.length - 1);
    }
    s = "0." + s;
  } else {
    s = (parseInt(estFee) / 10 ** chainDecimals).toString();
  }
  return parseFloat(s) !== 0 ? s : "0";
};

/**
 * @name unimplemented
 * @summary A placeholder function to signal a deliberate unimplementation.
 * Consumes an arbitrary number of props.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
export const unimplemented = ({ ...props }) => {
  /* unimplemented */
};

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */

export const mergeDeep = (
  target: AnyObject,
  ...sources: AnyObject[]
): AnyObject => {
  if (!sources.length) {
    return target;
  }

  const isObject = (item: AnyObject) =>
    item && typeof item === "object" && !Array.isArray(item);
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) {
          Object.assign(target, { [key]: {} });
        }
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  return mergeDeep(target, ...sources);
};

/**
 * @name stringToBigNumber
 * @summary Converts a balance string into a `BigNumber`.
 */
export const stringToBigNumber = (value: string): BigNumber =>
  new BigNumber(rmCommas(value));
