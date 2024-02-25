/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import minimist from "minimist";
import * as extensionAssets from "./builders/extension-assets";

const args = minimist(process.argv.slice(2));

const { t: task } = args;

switch (task) {
  case "build:extension-assets":
    extensionAssets.build();
    break;

  default:
    console.log("❌ No task provided.");
}
