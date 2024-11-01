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

  test("commas are removed from strings and the conversion works.", () => {
    const result = fn.planckToUnit("10,000,000", 2);
    expect(result).toEqual("100000.00");
  });

  test("Invalid number values should result in a '0' result", () => {
    const result = fn.planckToUnit("invalid&#l-", 2);
    expect(result).toEqual("0");
  });

  test("should correctly convert a BigInt to a string", () => {
    const result = fn.planckToUnit(10000000n, 6);
    expect(result).toEqual("10.000000");
  });

  test("negative units are converted to 0 units", () => {
    const result = fn.planckToUnit(10000000n, -2);
    expect(result).toEqual("10000000");
  });

  test("negative units are converted to 0 units", () => {
    const result = fn.planckToUnit(119324831n, -2);
    expect(result).toEqual("119324831");
  });

  test("function handles very large unit values.", () => {
    const result = fn.planckToUnit(10n, 100);
    expect(result).toEqual(
      "0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010"
    );
  });

  test("function rounds down decimal unit values to an integer.", () => {
    const result = fn.planckToUnit(10n, 0.1);
    expect(result).toEqual("10");
  });

  test("function rounds up decimal unit values to an integer.", () => {
    const result = fn.planckToUnit(10n, 0.7);
    expect(result).toEqual("1.0");
  });

  test("function rounds up decimal larger unit values to an integer.", () => {
    const result = fn.planckToUnit(10n, 9.7);
    expect(result).toEqual("0.0000000010");
  });
});

// Test suite for the `unitToPlanck` function.
describe("unitToPlanck", () => {
  test("should return valid planck value for a BigInt input", () => {
    const result = fn.unitToPlanck(5n, 8);
    expect(result).toEqual(500000000n);
  });

  test("should return valid planck value for a string input.", () => {
    const result = fn.unitToPlanck("0.2", 10);
    expect(result).toEqual(2000000000n);
  });

  test("should return valid planck value for a string input.", () => {
    const result = fn.unitToPlanck("0.001", 10);
    expect(result).toEqual(10000000n);
  });

  test("Invalid when units are smaller than decimals - returns zero.", () => {
    const result = fn.unitToPlanck("0.0001", 3);
    expect(result).toEqual(0n);
  });

  test("Valid when unit value is decimals + 1.", () => {
    const result = fn.unitToPlanck("0.0001", 4);
    expect(result).toEqual(1n);
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

  test("should correctly return the same value if negative units are provided", () => {
    const result = fn.unitToPlanck("100000", -6);
    expect(result).toEqual(100000n);
  });

  test("should correctly return the same value if negative units are provided", () => {
    const result = fn.unitToPlanck("1012192100", -3);
    expect(result).toEqual(1012192100n);
  });

  test("should correctly return the same value if negative units are provided", () => {
    const result = fn.unitToPlanck("1,012,192,100", -3);
    expect(result).toEqual(1012192100n);
  });

  test("should return 0 for an empty string", () => {
    const result = fn.unitToPlanck("", 8);
    expect(result).toEqual(0n);
  });

  test("should return 0 for a non-numeric string", () => {
    const result = fn.unitToPlanck("invalid&#l-", 4);
    expect(result).toEqual(0n);
  });

  test("function rounds down decimal unit values to an integer.", () => {
    const result = fn.unitToPlanck(1000000n, 5.2);
    expect(result).toEqual(100000000000n);
  });

  test("function rounds up decimal unit values to an integer.", () => {
    const result = fn.unitToPlanck(1234567789012n, 14.8);
    expect(result).toEqual(1234567789012000000000000000n);
  });

  test("function handles very large unit values.", () => {
    const result = fn.unitToPlanck(10n, 100);
    expect(result).toEqual(
      100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n
    );
  });
});
