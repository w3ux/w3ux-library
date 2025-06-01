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
import type { Bundler } from 'types'
import { promisify } from 'util'

const execPromisify = promisify(exec)

export const simpleBuild = async (
  packageName: string,
  { bundler }: { bundler: Bundler | null }
) => {
  const libDirectory = gePackageDirectory(packageName)

  // Validate package config
  try {
    if (!(await prebuild(packageName))) {
      throw `Prebuild failed.`
    }

    // Call respective build command and generate dist folder
    try {
      await execPromisify(`pnpm build`)
    } catch (e) {
      throw `Failed to generate dist. ${e}`
    }

    // Generate package.json
    if (
      !(await generatePackageJson(
        libDirectory,
        `${libDirectory}/${PACKAGE_OUTPUT}`,
        bundler
      ))
    ) {
      throw `Failed to generate package.json file.`
    }
    console.log(`✅ Package successfully built.`)
  } catch (err) {
    // Handle on error.
    console.error(`❌ Error occurred while building the package.`, err)

    // Remove package output directory
    if (!(await removePackageOutput(libDirectory, false))) {
      console.error(`❌ Failed to remove package output directory.`)
    }
  }
}
