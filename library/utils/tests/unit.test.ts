/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { describe, expect, test } from "vitest";
import * as fn from "../src/index";
import BigNumber from "bignumber.js";

describe("Tests suite - planckToUnit Function", () => {
  test("should correctly convert a BigNumber to units", () => {
    const inputValue = new BigNumber("10000000");
    const units = 6;
    const expectedOutput = new BigNumber("10.000000");
    const result = fn.planckToUnit(inputValue, units);
    expect(result).toEqual(expectedOutput);
  });

  test("should throw error when negative units", () => {
    const inputValue = new BigNumber("10000000");
    const units = -2;
    expect(() => fn.planckToUnit(inputValue, units)).toThrowError(
      "[BigNumber Error] Argument out of range: -2"
    );
  });
});

describe("Test suite - unitToPlanck Function", () => {
  test("should correctly convert a string to planck with positive units", () => {
    const val = "10";
    const units = 6;
    const expectedOutput = new BigNumber("10000000");
    const result = fn.unitToPlanck(val, units);
    expect(result).toEqual(expectedOutput);
  });

  test("should correctly convert a string to planck with zero units", () => {
    const val = "42";
    const units = 0;
    const expectedOutput = new BigNumber("42");
    const result = fn.unitToPlanck(val, units);
    expect(result).toEqual(expectedOutput);
  });

  test("should correctly convert a string to planck with negative units but return integer", () => {
    const val = "100000";
    const units = -6;
    const expectedOutput = new BigNumber("0");
    const result = fn.unitToPlanck(val, units);
    expect(result).toEqual(expectedOutput);
  });

  test("should return 0 for an empty string", () => {
    const val = "";
    const units = 8;
    const expectedOutput = new BigNumber("0");
    const result = fn.unitToPlanck(val, units);
    expect(result).toEqual(expectedOutput);
  });

  test("should return 0 for a non-numeric string", () => {
    const val = "invalid";
    const units = 4;
    const expectedOutput = new BigNumber("0");
    const result = fn.unitToPlanck(val, units);
    expect(result).toEqual(expectedOutput);
  });
});

describe("Tests suite - transformToBaseUnit Function", () => {
  test("Should accept a fee (275002583), chain has 9 decimals", () => {
    const result = fn.transformToBaseUnit("275002583", 9);
    expect(result).toBe("0.275002583");
  });

  test("Should accept a fee (275002583), chain has 20 decimals", () => {
    const result = fn.transformToBaseUnit("275002583", 20);
    expect(result).toBe("0.0000000000275002583");
  });

  test("Should accept a very small fee (23), chain has 9 decimals", () => {
    const result = fn.transformToBaseUnit("23", 9);
    expect(result).toBe("0.00000023");
  });

  test("Should accept a very small fee (23), chain has 18 decimals", () => {
    const result = fn.transformToBaseUnit("23", 18);
    expect(result).toBe("0.00000000000000023");
  });

  test("Should accept a fee (20000000000), chain has 18 decimals (aka ETH example)", () => {
    const result = fn.transformToBaseUnit((20 * 10 ** 7).toString(), 18);
    expect(result).toBe("0.000000002");
  });

  test("Should accept a huge fee (2350000000), chain has 9 decimals", () => {
    const result = fn.transformToBaseUnit((235 * 10 ** 7).toString(), 9);
    expect(result).toBe("2.35");
  });

  test("Should has 0 fee and return 0", () => {
    const result = fn.transformToBaseUnit("0", 9);
    expect(result).toBe("0");
  });

  test("Should has 0.0000 fee and return 0", () => {
    const result = fn.transformToBaseUnit("0.0000", 20);
    expect(result).toBe("0");
  });
});
