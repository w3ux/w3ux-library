/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { blake2b } from 'blakejs'

/**
 * Creates a BLAKE2b hash of the input data and returns it as a Uint8Array.
 *
 * @param data - The input data to hash, as a string, Uint8Array, or Buffer.
 * @param bitLength - The bit length of the hash output (default 256).
 * @returns The BLAKE2b hash output as a Uint8Array.
 */
export const blake2AsU8a = (
	data: Uint8Array | string | Buffer,
	bitLength = 256,
): Uint8Array => {
	// Convert input to Uint8Array if it's a string
	const input = typeof data === 'string' ? new TextEncoder().encode(data) : data

	// Calculate byte length from bit length (256 bits => 32 bytes)
	const byteLength = bitLength / 8

	// Generate the hash using blake2b with the specified output length
	const hash = blake2b(input, undefined, byteLength)

	return new Uint8Array(hash)
}
