/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseAutoFitTextOptions {
	minFontSize?: number
	maxFontSize?: number
	unit?: string
}

export const useAutoFitText = ({
	minFontSize = 0.625,
	maxFontSize = 1.08,
	unit = 'rem',
}: UseAutoFitTextOptions = {}) => {
	const containerRef = useRef<HTMLElement>(null)
	const [fontSize, setFontSize] = useState(`${maxFontSize}${unit}`)

	const calculateOptimalFontSize = useCallback(
		(container: HTMLElement) => {
			const containerWidth = container.offsetWidth

			if (containerWidth === 0) return

			// Store original font size to restore after measurement
			const originalFontSize = container.style.fontSize

			// Binary search for the optimal font size
			// scrollWidth gives us the actual width needed for the text content at each font size
			let low = minFontSize
			let high = maxFontSize
			let bestSize = minFontSize

			// Use a precision of 0.001 for decimal units like rem
			const precision = 0.001

			while (high - low > precision) {
				const mid = (low + high) / 2
				container.style.fontSize = `${mid}${unit}`

				// scrollWidth measures the text content width at this font size
				const scrollWidth = container.scrollWidth

				if (scrollWidth <= containerWidth) {
					bestSize = mid
					low = mid
				} else {
					high = mid
				}
			}

			// Restore original font size before updating state
			container.style.fontSize = originalFontSize

			// Only update state if the value actually changed
			const newFontSize = `${bestSize}${unit}`
			setFontSize((prev) => (prev === newFontSize ? prev : newFontSize))
		},
		[minFontSize, maxFontSize, unit],
	)

	useEffect(() => {
		const container = containerRef.current
		if (!container) return

		// Debounce timer to prevent excessive recalculations
		let debounceTimer: ReturnType<typeof setTimeout> | null = null

		const debouncedCalculate = () => {
			if (debounceTimer) clearTimeout(debounceTimer)
			debounceTimer = setTimeout(() => {
				calculateOptimalFontSize(container)
			}, 5)
		}

		// ResizeObserver handles container size changes (including window resize)
		const resizeObserver = new ResizeObserver(debouncedCalculate)

		// Watch for text content changes (e.g., language switches)
		const mutationObserver = new MutationObserver(debouncedCalculate)

		// Initial calculation
		resizeObserver.observe(container)
		mutationObserver.observe(container, {
			childList: true,
			subtree: true,
			characterData: true,
		})

		// Trigger initial calculation after mount
		calculateOptimalFontSize(container)

		return () => {
			if (debounceTimer) clearTimeout(debounceTimer)
			resizeObserver.disconnect()
			mutationObserver.disconnect()
		}
	}, [calculateOptimalFontSize])

	return { containerRef, fontSize }
}
