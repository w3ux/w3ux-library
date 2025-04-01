/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { createRef, useEffect, useRef, useState } from 'react'
import './index.css'
import type { Digit, DigitRef, Direction, Props, Status } from './types'

export const Odometer = ({
  value,
  spaceBefore = 0,
  spaceAfter = '0.25rem',
  wholeColor = 'var(--text-color-primary)',
  decimalColor = 'var(--text-color-secondary)',
  zeroDecimals = 0,
}: Props) => {
  // Store all possible digits.
  const [allDigits] = useState<Digit[]>([
    'comma',
    'dot',
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
  ])

  // Store the digits of the current value.
  const [digits, setDigits] = useState<Digit[]>([])

  // Store digits of the previous value.
  const [prevDigits, setPrevDigits] = useState<Digit[]>([])

  // Store the status of the odometer (transitioning or stable).
  const [status, setStatus] = useState<Status>('inactive')

  // Store whether component has iniiialized.
  const [initialized, setInitialized] = useState<boolean>(false)

  // Store ref of the odometer.
  const [odometerRef] = useState(createRef<HTMLSpanElement>())

  // Store refs of each digit.
  const [digitRefs, setDigitRefs] = useState<DigitRef[]>([])

  // Store refs of each `all` digit.
  const [allDigitRefs, setAllDigitRefs] = useState<Record<string, DigitRef>>({})

  // Keep track of active transitions.
  const activeTransitionCounter = useRef<number>(0)

  // Transition duration.
  const DURATION_MS = 750
  const DURATION_SECS = `${DURATION_MS / 1000}s`

  // Phase 0: populate `allDigitRefs`.
  useEffect(() => {
    const all: Record<string, DigitRef> = Object.fromEntries(
      Object.values(allDigits).map((v) => [`d_${v}`, createRef()])
    )

    setAllDigitRefs(all)
  }, [])

  // Phase 1: new digits and refs are added to the odometer.
  useEffect(() => {
    if (Object.keys(allDigitRefs)) {
      value =
        String(value) === '0' ? Number(value).toFixed(zeroDecimals) : value

      const newDigits = value
        .toString()
        .split('')
        .map((v) => (v === '.' ? 'dot' : v))
        .map((v) => (v === ',' ? 'comma' : v)) as Digit[]

      setDigits(newDigits)

      if (!initialized) {
        setInitialized(true)
      } else {
        setStatus('new')
        setPrevDigits(digits)
      }
      setDigitRefs(Array(newDigits.length).fill(createRef()))
    }
  }, [value])

  // Phase 2: set up digit transition.
  useEffect(() => {
    if (status === 'new' && !digitRefs.find((d) => d.current === null)) {
      setStatus('transition')
      activeTransitionCounter.current++

      setTimeout(() => {
        activeTransitionCounter.current--
        if (activeTransitionCounter.current === 0) {
          setStatus('inactive')
        }
      }, DURATION_MS)
    }
  }, [status, digitRefs])

  const odometerCurrent: Element = odometerRef?.current
  let lineHeight = odometerCurrent
    ? window.getComputedStyle(odometerCurrent).lineHeight
    : 'inherit'

  // Fallback line height to `1.1rem` if `normal`.
  lineHeight = lineHeight === 'normal' ? '1.1rem' : lineHeight

  // Track whether decimal point has been found.
  let foundDecimal = false

  return (
    <>
      {allDigits.map((d, i) => (
        <span
          key={`odometer_template_digit_${i}`}
          ref={allDigitRefs[`d_${d}`]}
          style={{
            opacity: 0,
            position: 'fixed',
            top: '-999%',
            left: '-999%',
            userSelect: 'none',
          }}
        >
          {d === 'dot' ? '.' : d === 'comma' ? ',' : d}
        </span>
      ))}
      <span className="odometer">
        <span className="odometer-inner" ref={odometerRef}>
          {spaceBefore ? <span style={{ paddingLeft: spaceBefore }} /> : null}
          {digits.map((d, i) => {
            if (d === 'dot') {
              foundDecimal = true
            }

            // If transitioning, get digits needed to animate.
            let childDigits = null
            if (status === 'transition') {
              const digitsToAnimate = []
              const digitIndex = allDigits.indexOf(digits[i])
              const prevDigitIndex = allDigits.indexOf(prevDigits[i])
              const difference = Math.abs(digitIndex - prevDigitIndex)
              const delay = `${0.01 * (digits.length - i - 1)}s`
              const direction: Direction =
                digitIndex === prevDigitIndex ? 'none' : 'down'
              const animClass = `slide-${direction}-${difference} `

              // Push current prev digit to stop of stack.
              digitsToAnimate.push(prevDigits[i])

              // If transitioning between two digits, animate all digits in between.
              if (digitIndex < prevDigitIndex) {
                digitsToAnimate.push(
                  ...Array.from(
                    { length: difference },
                    (_, k) => allDigits[prevDigitIndex - k - 1]
                  )
                )
              } else {
                digitsToAnimate.push(
                  ...Array.from(
                    { length: difference },
                    (_, k) => allDigits[k + prevDigitIndex + 1]
                  )
                )
              }

              childDigits = (
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    animationName: direction === 'none' ? undefined : animClass,
                    animationDuration:
                      direction === 'none' ? undefined : DURATION_SECS,
                    animationFillMode: 'forwards',
                    animationTimingFunction: 'cubic-bezier(0.1, 1, 0.2, 1)',
                    animationDelay: delay,
                    color: foundDecimal ? decimalColor : wholeColor,
                    userSelect: 'none',
                  }}
                >
                  {digitsToAnimate.map((c, j) => (
                    <span
                      key={`child_digit_${j}`}
                      className="odometer-digit odometer-child"
                      style={{
                        top: j === 0 ? 0 : `${100 * j}%`,
                        height: lineHeight,
                        lineHeight,
                      }}
                    >
                      {c === 'dot' ? '.' : c === 'comma' ? ',' : c}
                    </span>
                  ))}
                </span>
              )
            }

            return (
              <span
                key={`digit_${i}`}
                ref={digitRefs[i]}
                className="odometer-digit"
                style={{
                  color: foundDecimal ? decimalColor : wholeColor,
                  height: lineHeight,
                  lineHeight,
                  paddingRight:
                    status === 'transition'
                      ? `${allDigitRefs[`d_${d}`]?.current?.offsetWidth}px`
                      : '0',
                }}
              >
                {status === 'inactive' && (
                  <span
                    className="odometer-digit odometer-child"
                    style={{
                      top: 0,
                      height: lineHeight,
                      lineHeight,
                      width: `${
                        allDigitRefs[`d_${d}`]?.current?.offsetWidth
                      }px`,
                    }}
                  >
                    {d === 'dot' ? '.' : d === 'comma' ? ',' : d}
                  </span>
                )}
                {status === 'transition' && childDigits}
              </span>
            )
          })}
          {spaceAfter ? <span style={{ paddingRight: spaceAfter }} /> : null}
        </span>
      </span>
    </>
  )
}

export default Odometer
