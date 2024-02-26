/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import fs from "fs/promises";
import { join } from "path";
import { PACKAGE_OUTPUT, TEMP_BUILD_OUTPUT } from "config";
import { prebuild } from "builders/common/prebuild";
import { gePackageDirectory, removePackageOutput } from "builders/util";
import { promisify } from "util";
import { exec } from "child_process";

const execPromisify = promisify(exec);

export const build = async () => {
  const folder = "validator-assets";
  const libDirectory = gePackageDirectory(folder);

  try {
    // Prebuild integrity checks.
    if (!(await prebuild(folder))) {
      throw `Prebuild failed.`;
    }

    // Create temp output directory.
    try {
      fs.mkdir(`${libDirectory}/${TEMP_BUILD_OUTPUT}`, { recursive: true });
    } catch (e) {
      throw `Failed to make output directory.`;
    }

    // Call tsup command to build dist folder.
    try {
      await execPromisify(`cd ../library/${folder} && yarn build`);
    } catch (e) {
      throw `Failed to generate dist.`;
    }

    // Generate package.json.
    if (
      !(await generatePackageJson(
        libDirectory,
        `${libDirectory}/${PACKAGE_OUTPUT}`
      ))
    ) {
      throw `Failed to generate package.json file.`;
    }

    // Remove tmp build directory if it exists.
    if (!(await removePackageOutput(libDirectory, true))) {
      console.error(`❌ Failed to remove tmp build directory.`);
    }

    console.log(`✅ Package successfully built.`);
  } catch (err) {
    // Handle on error.
    console.error(`❌ Error occurred while building the package.`, err);

    // Remove package output directory if it exists.
    if (!(await removePackageOutput(libDirectory, false))) {
      console.error(`❌ Failed to remove package output directory.`);
    }
    // Remove tmp build directory if it exists.
    if (!(await removePackageOutput(libDirectory, true))) {
      console.error(`❌ Failed to remove tmp build directory.`);
    }
  }
};

// Generate package package.json file from source package.json.
const generatePackageJson = async (
  inputDir: string,
  outputDir: string
): Promise<boolean> => {
  try {
    // Read the original package.json.
    const packageJsonPath = join(inputDir, "package.json");
    const originalPackageJson = await fs.readFile(packageJsonPath, "utf8");
    const parsedPackageJson = JSON.parse(originalPackageJson);

    // Extract only the specified fields.
    const { name, version, license, type } = parsedPackageJson;
    const packageName = name.replace(/-source$/, ""); // Remove '-source' suffix.

    // Construct the minimal package.json object
    const minimalPackageJson = {
      name: packageName,
      version,
      license,
      type,
    };

    // Write the minimal package.json to the output directory.
    const outputPath = join(outputDir, "package.json");
    await fs.writeFile(outputPath, JSON.stringify(minimalPackageJson, null, 2));

    return true;
  } catch (error) {
    console.error("❌ Error generating minimal package.json:", error);
    return false;
  }
};
