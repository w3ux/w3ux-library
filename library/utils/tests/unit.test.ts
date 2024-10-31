/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { describe, expect, test } from "vitest";
import * as fn from "../src/index";

// Test suite for the `planckToUnit` function.
describe("planckToUnit", () => {
  test("should correctly output a `string` given another`BigInt`", () => {
    const result = fn.planckToUnit(10000000n, 6);
    expect(result).toEqual("10.000000");
  });

  test("should correctly output a `string` given another`string`", () => {
    const result = fn.planckToUnit("10000000", 6);
    expect(result).toEqual("10.000000");
  });

  test("should correctly output a `string` given a `number`", () => {
    const result = fn.planckToUnit(10000000, 6);
    expect(result).toEqual("10.000000");
  });

  test("should correctly return a decimal string if units are greater than exponent", () => {
    const result = fn.planckToUnit(10n, 10);
    expect(result).toEqual("0.0000000010");
  });

  test("values with commas are not supported and will result in a '0' result", () => {
    const result = fn.planckToUnit("10,000,000", 2);
    expect(result).toEqual("0");
  });

  test("Invalid number values should result in a '0' result", () => {
    const result = fn.planckToUnit("invalid&#l-", 2);
    expect(result).toEqual("0");
  });

  test("should correctly convert a BigInt to a string", () => {
    const result = fn.planckToUnit("10000000", 6);
    expect(result).toEqual("10.000000");
  });

  test("negative units are converted to 0 units", () => {
    const result = fn.planckToUnit(10000000n, -2);
    expect(result).toEqual("10000000");
  });
});

// Test suite for the `unitToPlanck` function.
describe("unitToPlanck", () => {
  test("should return valid planck value for a BigInt input", () => {
    const result = fn.unitToPlanck(5n, 8);
    expect(result).toEqual(500000000n);
  });

  test("should return valid planck value for a string input", () => {
    const result = fn.unitToPlanck("5", 6);
    expect(result).toEqual(5000000n);
  });

  test("should return valid planck value for a number input", () => {
    const result = fn.unitToPlanck(5, 4);
    expect(result).toEqual(50000n);
  });

  test("should correctly convert a string to planck with positive units", () => {
    const result = fn.unitToPlanck("10", 6);
    expect(result).toEqual(10000000n);
  });

  test("should correctly return the same number with zero units", () => {
    const result = fn.unitToPlanck(42, 0);
    expect(result).toEqual(42n);
  });

  test("should correctly convert a string to 0n with negative units", () => {
    const result = fn.unitToPlanck("100000", -6);
    expect(result).toEqual(0n);
  });

  test("should return 0 for an empty string", () => {
    const result = fn.unitToPlanck("", 8);
    expect(result).toEqual(0n);
  });

  test("should return 0 for a non-numeric string", () => {
    const result = fn.unitToPlanck("invalid&#l-", 4);
    expect(result).toEqual(0n);
  });
});

describe("transformToBaseUnit", () => {
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

describe("maxBigInt", () => {
  test("returns the maximum value in a list of positive BigInts", () => {
    expect(fn.maxBigInt(10n, 50n, 30n, 100n, 20n)).toEqual(100n);
  });

  test("returns the maximum value in a list containing negative BigInts", () => {
    expect(fn.maxBigInt(-10n, -50n, -30n, -100n, -20n)).toEqual(-10n);
  });

  test("returns the correct maximum value when only one BigInt is provided", () => {
    expect(fn.maxBigInt(42n)).toEqual(42n);
  });

  test("returns the maximum value when BigInts of varying signs are provided", () => {
    expect(fn.maxBigInt(-1000n, 500n, -200n, 1000n)).toEqual(1000n);
  });

  test("throws a TypeError if no values are provided", () => {
    expect(() => fn.maxBigInt()).toThrow(TypeError);
  });
});

describe("minBigInt", () => {
  test("returns the minimum value in a list of positive BigInts", () => {
    expect(fn.minBigInt(10n, 50n, 30n, 100n, 20n)).toEqual(10n);
  });

  test("returns the minimum value in a list containing negative BigInts", () => {
    expect(fn.minBigInt(-10n, -50n, -30n, -100n, -20n)).toEqual(-100n);
  });

  test("returns the correct minimum value when only one BigInt is provided", () => {
    expect(fn.minBigInt(42n)).toEqual(42n);
  });

  test("returns the minimum value when BigInts of varying signs are provided", () => {
    expect(fn.minBigInt(-1000n, 500n, -200n, 1000n)).toEqual(-1000n);
  });

  test("throws a TypeError if no values are provided", () => {
    expect(() => fn.minBigInt()).toThrow(TypeError);
  });
});
