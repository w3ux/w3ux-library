import { MutableRefObject, useEffect, useRef } from "react";

interface UseOnResizeOptions {
  outerElement?: MutableRefObject<HTMLElement | null | undefined>;
  throttle?: number;
}

// Hook to execute a callback function on window resize, with optional throttling.
export const useOnResize = (
  callback: () => void,
  options: UseOnResizeOptions = {}
) => {
  const { outerElement, throttle: throttleDuration = 100 } = options;
  const lastExecutedRef = useRef<number>(0);

  // Throttled resize handler
  const handleResize = () => {
    const now = Date.now();
    if (now - lastExecutedRef.current < throttleDuration) {
      return;
    }

    lastExecutedRef.current = now;
    callback();
  };

  useEffect(() => {
    // Determine the target for the resize event listener.
    // If `outerElement` is provided, listen to its resize events; otherwise, listen to the window's.
    const listenFor = outerElement?.current || window;

    // Add event listener for resize on mount.
    listenFor.addEventListener("resize", handleResize);

    // Clean up event listener on unmount.
    return () => {
      listenFor.removeEventListener("resize", handleResize);
    };
  }, [throttleDuration, callback]);
};
