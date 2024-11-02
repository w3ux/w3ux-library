/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { useEffect, useState } from "react";
import { getCircleCoordinates, getColors } from "./utils";
import { isValidAddress } from "@w3ux/utils";
import { CircleRadius, PolkiconCenter } from "./consts";
import { Circle, Coordinate } from "./types";

interface PolkiconProps {
  size?: number | string;
  address: string;
  inactive?: boolean;
  outerColor?: string;
}

export const Polkicon = ({
  size = "2rem",
  address,
  inactive,
  outerColor,
}: PolkiconProps) => {
  // The colors of the Polkicon and inner circles.
  const [colors, setColors] = useState<string[]>([]);

  // The coordinates of the Polkicon circles.
  const [coords, setCoords] = useState<Coordinate[]>();

  // TODO: Refactor this in favor of `transform` and sizing based on parent element.
  const [s, setS] = useState<string | number>();

  // Renders the outer circle of the Polkicon.
  const renderOuterCircle = (fill: string): Circle => ({
    cx: PolkiconCenter,
    cy: PolkiconCenter,
    fill,
    r: PolkiconCenter,
  });

  // Renders a circle element of the Polkicon.
  const renderCircle = ({ cx, cy, fill, r }: Circle, key: number) => (
    <circle cx={cx} cy={cy} fill={fill} key={key} r={r} />
  );

  useEffect(() => {
    const InfoText = (type: string, value: string | number) =>
      console.warn(
        `Polkicon: 'Size' expressed in '${type}' cannot be less than ${value}. Will be resized to minimum size.`
      );

    if (
      typeof size === "string" &&
      !size.includes("px") &&
      !size.includes("rem")
    ) {
      throw new Error(
        "Providing a string for 'size' in Polkicon should be expressed either in 'px', 'rem' or 'em'"
      );
    }

    let sizeNumb: number;
    let fontType: string;
    if (typeof size === "string") {
      fontType = size.replace(/[0-9.]/g, "");
      switch (fontType) {
        case "px":
          sizeNumb = parseFloat(size);
          break;
        case "rem":
          sizeNumb = parseFloat(size) * 10;
          break;
      }
    } else if (typeof size === "number") {
      sizeNumb = size;
    }

    setS(
      fontType
        ? `${fontType === "px" ? sizeNumb + "px" : sizeNumb / 10 + "rem"}`
        : sizeNumb
    );
    if (sizeNumb < 12) {
      InfoText(
        fontType || "number",
        fontType === "px" ? "12px" : fontType === "rem" ? "1.2rem" : 12
      );
    }
  }, [size]);

  // Generate Polkicon coordinates and colors based on the address validity and inactivity status.
  // Re-renders on `address` change.
  useEffect(() => {
    // Generate Polkicon coordinates.
    const circleXy = getCircleCoordinates();
    // Get the amount of Polkicon circles.
    const length = circleXy.length;
    // Generate the colors of the Polkicon.
    const colors =
      isValidAddress(address) && !inactive
        ? getColors(address)
        : Array.from({ length }, () => "var(--background-invert)");

    setCoords(circleXy);
    setColors(colors);
  }, [address]);

  return (
    coords && (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <svg
          viewBox="0 0 64 64"
          id={address}
          name={address}
          width={s}
          height={s}
        >
          {[renderOuterCircle(outerColor || "var(--background-default)")]
            .concat(
              coords.map(([cx, cy], index) => ({
                cx,
                cy,
                fill: colors[index],
                r: CircleRadius,
              }))
            )
            .map(renderCircle)}
        </svg>
      </div>
    )
  );
};
