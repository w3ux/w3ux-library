/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { prebuild } from 'builders/common/prebuild'
import {
  gePackageDirectory,
  generatePackageJson,
  removePackageOutput,
} from 'builders/util'
import { exec } from 'child_process'
import { PACKAGE_OUTPUT } from 'config'
import { promisify } from 'util'

const execPromisify = promisify(exec)

export const build = async () => {
  const folder = 'react-odometer'
  const libDirectory = gePackageDirectory(folder)

  try {
    // Prebuild integrity checks.
    if (!(await prebuild(folder))) {
      throw `Prebuild failed.`
    }

    // Call gump command to build dist folder.
    try {
      await execPromisify(`cd ../library/${folder} && pnpm build`)
    } catch (e) {
      throw `Failed to generate dist. ${e}`
    }

    // Generate package.json.
    if (
      !(await generatePackageJson(
        libDirectory,
        `${libDirectory}/${PACKAGE_OUTPUT}`,
        'gulp'
      ))
    ) {
      throw `Failed to generate package.json file.`
    }

    console.log(`✅ Package successfully built.`)
  } catch (err) {
    // Handle on error.
    console.error(`❌ Error occurred while building the package.`, err)

    // Remove package output directory if it exists.
    if (!(await removePackageOutput(libDirectory, false))) {
      console.error(`❌ Failed to remove package output directory.`)
    }
  }
}
