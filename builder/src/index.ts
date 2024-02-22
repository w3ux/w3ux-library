/* @license Copyright 2024 @polkadot-cloud/library authors & contributors",
"SPDX-License-Identifier: GPL-3.0-only */

import minimist from "minimist";

const args = minimist(process.argv.slice(2));

// eslint-disable-next-line
const { t: task, ...rest } = args;

switch (task) {
  case "package:build":
    // packages.build(rest);
    break;

  default:
    console.log("❌ No task provided.");
}
