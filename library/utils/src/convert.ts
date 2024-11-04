// /* @license Copyright 2024 w3ux authors & contributors
// SPDX-License-Identifier: GPL-3.0-only */

// /**
//  * Converts a string to a Uint8Array.
//  *
//  * @function stringToU8a
//  * @param {string} input - The string to convert.
//  * @returns {Uint8Array} The resulting Uint8Array.
//  */
// export const stringToU8a = (input: string): Uint8Array => {
//   // Create a new Uint8Array with the length of the input string
//   const u8a = new Uint8Array(input.length);

//   // Fill the Uint8Array with the character codes of the input string
//   for (let i = 0; i < input.length; i++) {
//     u8a[i] = input.charCodeAt(i);
//   }
//   return u8a;
// };

// /**
//  * Converts a Uint8Array to a string.
//  *
//  * @function u8aToString
//  * @param {Uint8Array} u8a - The Uint8Array to convert.
//  * @returns {string} The resulting string.
//  */
// export const u8aToString = (u8a: Uint8Array): string => {
//   // Create an array to hold the characters
//   const chars = new Array(u8a.length);

//   // Fill the array with characters from the Uint8Array
//   for (let i = 0; i < u8a.length; i++) {
//     chars[i] = String.fromCharCode(u8a[i]);
//   }

//   // Join the array into a single string
//   return chars.join("");
// };

// /**
//  * Concatenates multiple Uint8Array instances into a single Uint8Array.
//  *
//  * @param {Uint8Array[]} u8as - An array of Uint8Array instances to concatenate.
//  * @returns {Uint8Array} A new Uint8Array containing all the input arrays concatenated.
//  */
// export const u8aConcat = (...u8as: Uint8Array[]): Uint8Array => {
//   // Calculate the total length of the resulting Uint8Array
//   const totalLength = u8as.reduce((sum, u8a) => sum + u8a.length, 0);

//   // Create a new Uint8Array with the total length
//   const result = new Uint8Array(totalLength);

//   let offset = 0; // Initialize the offset for placing elements
//   for (const u8a of u8as) {
//     result.set(u8a, offset); // Set the current Uint8Array at the current offset
//     offset += u8a.length; // Update the offset for the next Uint8Array
//   }

//   return result;
// };
