/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { blake2AsU8a } from '@w3ux/crypto'
import { encodeAddress } from 'dedot/utils'
import { PolkiconCenter, SCHEMA } from './consts'
import type { Coordinate, Scheme } from './types'

/* A generic identity icon. Circle generation logic taken from:
https://github.com/polkadot-js/ui/tree/master/packages/react-identicon */

/**
 * Generates a color palette based on an address by creating a hashed identifier and using it to
 * select a color scheme and adjust colors for hue, saturation, and lightness.
 * - Calculates a unique `id` from the address and determines a `scheme` based on weighted
 *   frequency.
 * - Uses specific bytes in `id` to control rotation (`rot`) and saturation (`sat`) values for color
 *   adjustments.
 * - Creates a palette of HSL colors, mapping the selected `scheme` colors to the final output.
 *
 * @param address The input address string.
 * @returns An array of color strings in HSL format.
 */
export const getColors = (address: string): string[] => {
  const total = Object.values(SCHEMA)
    .map(({ freq }) => freq)
    .reduce((a, b) => a + b)

  const id = addressToId(address)
  const d = Math.floor((id[30] + id[31] * 256) % total)
  const rot = (id[28] % 6) * 3
  const sat = (Math.floor((id[29] * 70) / 256 + 26) % 80) + 30
  const scheme = findScheme(d)
  const palette = Array.from(id).map((x, i): string => {
    const b = (x + (i % 28) * 58) % 256

    if (b === 0) {
      return '#444'
    } else if (b === 255) {
      return 'transparent'
    }

    const h = Math.floor(((b % 64) * 360) / 64)
    const l = [53, 15, 35, 75][Math.floor(b / 64)]

    return `hsl(${h}, ${sat}%, ${l}%)`
  })

  return scheme.colors.map(
    (_, i): string => palette[scheme.colors[i < 18 ? (i + rot) % 18 : 18]]
  )
}

// Calculates and returns several rotational values based on an initial parameter C.
//
// The result is an object containing each of these computed rotational values.
const getRotation = (): {
  r: number
  ro2: number
  r3o4: number
  ro4: number
  rroot3o2: number
  rroot3o4: number
} => {
  const param_r = 3
  const param_rroot3o2 = 2
  const param_ro2 = 2
  const param_rroot3o4 = 4
  const param_ro4 = 4
  const param_r3o4 = 4

  const r = (PolkiconCenter / 4) * param_r
  const rroot3o2 = (r * Math.sqrt(3)) / param_rroot3o2
  const ro2 = r / param_ro2
  const rroot3o4 = (r * Math.sqrt(3)) / param_rroot3o4
  const ro4 = r / param_ro4
  const r3o4 = (r * 3) / param_r3o4

  return { r, r3o4, ro2, ro4, rroot3o2, rroot3o4 }
}

/*
 * Generates an array of (x, y) coordinates representing positions in a circular pattern.
 * - Uses `getRotation` to retrieve pre-calculated radial distances (`r`, `ro2`, `r3o4`, etc.) for
 *   positioning points around a central point `C` (assumed to be `PolkiconCenter`).
 * - Returns an array of coordinate pairs arranged symmetrically around `C`, forming a circular
 *   pattern by applying the radial distances in various combinations to `C`.
 *
 * @returns An array of [x, y] coordinates for each point in the circle pattern.
 */
export const getCircleCoordinates = (): Coordinate[] => {
  const { r, r3o4, ro2, ro4, rroot3o2, rroot3o4 } = getRotation()

  // Alias center coordinate for more concise code.
  const C = PolkiconCenter

  // Return all coordinates.
  return [
    [C, C - r],
    [C, C - ro2],
    [C - rroot3o4, C - r3o4],
    [C - rroot3o2, C - ro2],
    [C - rroot3o4, C - ro4],
    [C - rroot3o2, C],
    [C - rroot3o2, C + ro2],
    [C - rroot3o4, C + ro4],
    [C - rroot3o4, C + r3o4],
    [C, C + r],
    [C, C + ro2],
    [C + rroot3o4, C + r3o4],
    [C + rroot3o2, C + ro2],
    [C + rroot3o4, C + ro4],
    [C + rroot3o2, C],
    [C + rroot3o2, C - ro2],
    [C + rroot3o4, C - ro4],
    [C + rroot3o4, C - r3o4],
    [C, C],
  ]
}

/* Takes a number `d` and returns a scheme from `SCHEMA` based on cumulative frequency.
 *
 * Iterates over each scheme and checks if the cumulative frequency exceeds `d`. If `d` is less than
 * the current cumulative `out`, it returns that scheme.
 *
 * In effect, this function acts like a weighted random selector. Each scheme has a chance of being
 * picked based on its `freq` relative to the total frequency across all schemes.
 */
const findScheme = (d: number): Scheme => {
  const schemes = Object.values(SCHEMA)
  return schemes.find((scheme) => (d -= scheme.freq) < 0) ?? schemes[0]
}

/**
 * Converts an address string into a unique identifier by first encoding and decoding the address
 * using `AccountId`, then hashing it with BLAKE2.
 *
 * Each byte of the resulting hash is adjusted based on a predefined zero hash, creating a
 * consistent `Uint8Array` ID derived from the address.
 */
const addressToId = (address: string): Uint8Array => {
  // Generate a zero hash from a 32-byte zeroed array.
  const zeroHash = blake2AsU8a(new Uint8Array(32))

  // Get the encoded and decoded representation of the address, then hash it.
  const pubKeyHash = blake2AsU8a(encodeAddress(address))

  // Adjust each byte in the hash relative to zeroHash and return as a Uint8Array.
  return pubKeyHash.map((x, i) => (x + 256 - zeroHash[i]) % 256)
}

/**
 * Generates a CSS `scale` transform based on an input string that specifies an action ("grow" or
 * "shrink") and a numeric factor. The factor adjusts the scale up or down by 10% increments.
 *
 * @param input - A string in the format "action-factor" (e.g., "grow-2" or "shrink-3").
 * @returns A CSS `scale` transform string.
 */
export const generateCssTransform = (input: string) => {
  const [action, factorStr] = input.split('-')
  const factor = parseInt(factorStr, 10) * 0.1
  const scaleValue = action === 'grow' ? 1 + factor : 1 - factor
  return `scale(${scaleValue})`
}
