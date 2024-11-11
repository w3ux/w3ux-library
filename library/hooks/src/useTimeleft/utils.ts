/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { differenceInDays, getUnixTime, intervalToDuration } from "date-fns";
import { defaultDuration } from "./defaults";
import type { TimeleftDuration } from "./types";

// calculates the current timeleft duration.
export const getDuration = (toDate: Date | null): TimeleftDuration => {
  if (!toDate) {
    return defaultDuration;
  }
  if (getUnixTime(toDate) <= getUnixTime(new Date())) {
    return defaultDuration;
  }

  toDate.setSeconds(toDate.getSeconds());
  const d = intervalToDuration({
    start: Date.now(),
    end: toDate,
  });

  const days = differenceInDays(toDate, Date.now());
  const hours = d?.hours || 0;
  const minutes = d?.minutes || 0;
  const seconds = d?.seconds || 0;
  const lastHour = days === 0 && hours === 0;
  const lastMinute = lastHour && minutes === 0;

  return {
    days,
    hours,
    minutes,
    seconds,
    lastMinute,
  };
};
