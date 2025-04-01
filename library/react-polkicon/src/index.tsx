/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { isValidAddress } from '@w3ux/utils'
import { useEffect, useState } from 'react'
import { CircleRadius, PolkiconCenter, PolkiconSize } from './consts'
import type { Circle, Coordinate, PolkiconProps } from './types'
import { generateCssTransform, getCircleCoordinates, getColors } from './utils'

export const Polkicon = ({
  address,
  background,
  inactive,
  transform: propTransform,
  fontSize,
}: PolkiconProps) => {
  // The colors of the Polkicon and inner circles.
  const [colors, setColors] = useState<string[]>([])

  // The coordinates of the Polkicon circles.
  const [coords, setCoords] = useState<Coordinate[]>()

  // Renders the outer circle of the Polkicon.
  const renderOuterCircle = (fill: string): Circle => ({
    cx: PolkiconCenter,
    cy: PolkiconCenter,
    fill,
    r: PolkiconCenter,
  })

  // Renders a circle element of the Polkicon.
  const renderCircle = ({ cx, cy, fill, r }: Circle, key: number) => (
    <circle cx={cx} cy={cy} fill={fill} key={key} r={r} />
  )

  const transform = propTransform
    ? generateCssTransform(propTransform)
    : undefined

  // Generate Polkicon coordinates and colors based on the address validity and inactivity status.
  // Re-renders on `address` change.
  useEffect(() => {
    // Generate Polkicon coordinates.
    const circleXy = getCircleCoordinates()
    // Get the amount of Polkicon circles.
    const length = circleXy.length
    // Generate the colors of the Polkicon.
    const cols =
      isValidAddress(address) && !inactive
        ? getColors(address)
        : Array.from({ length }, () => 'var(--background-invert)')

    setCoords(circleXy)
    setColors(cols)
  }, [address])

  return (
    coords && (
      <span
        className="polkicon"
        style={{
          display: 'inline-block',
          verticalAlign: '-0.125em',
          height: '1em',
          width: 'auto',
          transform,
          fontSize,
        }}
      >
        <svg
          viewBox={`0 0 ${PolkiconSize} ${PolkiconSize}`}
          id={address}
          name={address}
          width="100%"
          height="100%"
        >
          {[renderOuterCircle(background || 'var(--background-default)')]
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
      </span>
    )
  )
}
