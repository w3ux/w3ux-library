/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { AccountId } from "@polkadot-api/substrate-bindings";
import { blake2AsU8a } from "@polkadot/util-crypto";
import { Scheme } from "./types";
import { PolkiconCenter, SCHEMA } from "./consts";

/* A generic identity icon. Circle generation logic taken from:
https://github.com/polkadot-js/ui/tree/master/packages/react-identicon */

// Calculates and returns several rotational values based on an initial parameter C.
//
// The result is an object containing each of these computed rotational values.
const getRotation = (): {
  r: number;
  ro2: number;
  r3o4: number;
  ro4: number;
  rroot3o2: number;
  rroot3o4: number;
} => {
  const param_r = 3;
  const param_rroot3o2 = 2;
  const param_ro2 = 2;
  const param_rroot3o4 = 4;
  const param_ro4 = 4;
  const param_r3o4 = 4;

  const r = (PolkiconCenter / 4) * param_r;
  const rroot3o2 = (r * Math.sqrt(3)) / param_rroot3o2;
  const ro2 = r / param_ro2;
  const rroot3o4 = (r * Math.sqrt(3)) / param_rroot3o4;
  const ro4 = r / param_ro4;
  const r3o4 = (r * 3) / param_r3o4;

  return { r, r3o4, ro2, ro4, rroot3o2, rroot3o4 };
};

export const getCircleCoordinates = (): [number, number][] => {
  const { r, r3o4, ro2, ro4, rroot3o2, rroot3o4 } = getRotation();

  // Alias center coordinate for more concise code.
  const C = PolkiconCenter;

  // Return all coordinates
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
  ];
};

// Takes a number `d` and returns a scheme from `SCHEMA` based on cumulative frequency.
//
// Iterates over each scheme and checks if the cumulative frequency exceeds `d`. If `d` is less than
// the current cumulative `out`, it returns that scheme.
//
// In effect, this function acts like a weighted random selector. Each scheme has a chance of being
// picked based on its `freq` relative to the total frequency across all schemes.
export const findScheme = (d: number): Scheme =>
  Object.values(SCHEMA).find((scheme) => (d -= scheme.freq) < 0);

const addressToId = (address: string): Uint8Array => {
  const zeroHash = blake2AsU8a(new Uint8Array(32));
  const codec = AccountId();
  const pubKey = codec.dec(codec.enc(address)).toString();
  return blake2AsU8a(pubKey).map(
    (x: number, i: string | number) => (x + 256 - zeroHash[i]) % 256
  );
};

export const getColors = (address: string): string[] => {
  const total = Object.values(SCHEMA)
    .map(({ freq }) => freq)
    .reduce((a, b) => a + b);

  const id = addressToId(address);
  const d = Math.floor((id[30] + id[31] * 256) % total);
  const rot = (id[28] % 6) * 3;
  const sat = (Math.floor((id[29] * 70) / 256 + 26) % 80) + 30;
  const scheme = findScheme(d);
  const palette = Array.from(id).map((x, i): string => {
    const b = (x + (i % 28) * 58) % 256;

    if (b === 0) {
      return "#444";
    } else if (b === 255) {
      return "transparent";
    }

    const h = Math.floor(((b % 64) * 360) / 64);
    const l = [53, 15, 35, 75][Math.floor(b / 64)];

    return `hsl(${h}, ${sat}%, ${l}%)`;
  });

  return scheme.colors.map(
    (_, i): string => palette[scheme.colors[i < 18 ? (i + rot) % 18 : 18]]
  );
};
