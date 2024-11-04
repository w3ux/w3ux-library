// /* @license Copyright 2024 w3ux authors & contributors
// SPDX-License-Identifier: GPL-3.0-only */

/**
 * Concatenates multiple Uint8Array instances into a single Uint8Array.
 *
 * @param {Uint8Array[]} u8as - An array of Uint8Array instances to concatenate.
 * @returns {Uint8Array} A new Uint8Array containing all the input arrays concatenated.
 */
export const u8aConcat = (...u8as: Uint8Array[]): Uint8Array => {
  // Calculate the total length of the resulting Uint8Array
  const totalLength = u8as.reduce((sum, u8a) => sum + u8a.length, 0);

  // Create a new Uint8Array with the total length
  const result = new Uint8Array(totalLength);

  let offset = 0; // Initialize the offset for placing elements
  for (const u8a of u8as) {
    result.set(u8a, offset); // Set the current Uint8Array at the current offset
    offset += u8a.length; // Update the offset for the next Uint8Array
  }

  return result;
};
