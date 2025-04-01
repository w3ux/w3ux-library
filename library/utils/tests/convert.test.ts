// /* @license Copyright 2024 w3ux authors & contributors
// SPDX-License-Identifier: GPL-3.0-only */

import { describe, expect, test } from 'vitest'
import * as fn from '../src/index'

describe('u8aConcat', () => {
  test('should concatenate multiple Uint8Array instances', () => {
    const u8a1 = new Uint8Array([1, 2, 3])
    const u8a2 = new Uint8Array([4, 5, 6])
    const u8a3 = new Uint8Array([7, 8])

    const result = fn.u8aConcat(u8a1, u8a2, u8a3)
    expect(result).toEqual(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]))
  })

  test('should handle an empty Uint8Array', () => {
    const u8a1 = new Uint8Array([1, 2, 3])
    const u8a2 = new Uint8Array([]) // Empty array

    const result = fn.u8aConcat(u8a1, u8a2)
    expect(result).toEqual(new Uint8Array([1, 2, 3])) // Should return the first array
  })

  test('should handle multiple empty Uint8Arrays', () => {
    const u8a1 = new Uint8Array([])
    const u8a2 = new Uint8Array([])

    const result = fn.u8aConcat(u8a1, u8a2)
    expect(result).toEqual(new Uint8Array([])) // Should return an empty array
  })

  test('should handle single Uint8Array', () => {
    const u8a1 = new Uint8Array([9, 10, 11])

    const result = fn.u8aConcat(u8a1)
    expect(result).toEqual(u8a1) // Should return the same array
  })

  test('should handle concatenation of different lengths', () => {
    const u8a1 = new Uint8Array([1, 2])
    const u8a2 = new Uint8Array([3])
    const u8a3 = new Uint8Array([4, 5, 6])

    const result = fn.u8aConcat(u8a1, u8a2, u8a3)
    expect(result).toEqual(new Uint8Array([1, 2, 3, 4, 5, 6])) // Should return concatenated result
  })

  test('should handle Uint8Arrays with non-consecutive values', () => {
    const u8a1 = new Uint8Array([0, 255])
    const u8a2 = new Uint8Array([128, 64])

    const result = fn.u8aConcat(u8a1, u8a2)
    expect(result).toEqual(new Uint8Array([0, 255, 128, 64])) // Should concatenate properly
  })
})
