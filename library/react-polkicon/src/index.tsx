/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { useEffect, useState } from "react";
import {
  Circle,
  getCircleCoordinates,
  outerCircle,
  renderCircle,
  Z,
  getColors,
} from "./utils";
import { isValidAddress } from "@w3ux/utils";

interface PolkiconProps {
  size?: number | string;
  address: string;
  colors?: string[];
  outerColor?: string;
}

export const Polkicon = ({
  size = "2rem",
  address,
  colors: initialColors,
  outerColor,
}: PolkiconProps) => {
  const [colors, setColors] = useState<string[]>([]);
  const [xy, setXy] = useState<[number, number][] | undefined>();

  const [s, setS] = useState<string | number>();

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

  useEffect(() => {
    const circleXy = getCircleCoordinates();
    if (initialColors && initialColors?.length < circleXy.length) {
      let initColIdx = 0;
      for (let i = 0; i < circleXy.length; i++) {
        if (!initialColors[i]) {
          initialColors[i] = initialColors[initColIdx++];
        }
        if (initColIdx == initialColors.length) {
          initColIdx = 0;
        }
      }
    }
    const defaultColors = new Array<string>(circleXy.length).fill("#ddd");
    const deactiveColors = new Array<string>(circleXy.length).fill(
      "var(--background-invert)"
    );

    setXy(circleXy);
    setColors(
      isValidAddress(address)
        ? initialColors || getColors(address) || defaultColors
        : deactiveColors
    );
  }, [address]);

  return (
    xy && (
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
          {[
            outerColor
              ? outerCircle(outerColor)
              : outerCircle("var(--background-default"),
          ]
            .concat(
              xy.map(
                ([cx, cy], index): Circle => ({
                  cx,
                  cy,
                  fill: colors[index],
                  r: Z,
                })
              )
            )
            .map(renderCircle)}
        </svg>
      </div>
    )
  );
};
