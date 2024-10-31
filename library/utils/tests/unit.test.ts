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
