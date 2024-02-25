/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { PACKAGE_OUTPUT, TEMP_BUILD_OUTPUT } from "config";
import fs from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Gets a builder source directory, relative to  the builder's dist directory.
//-------------------------------------------------------------
export const getBuilderDirectory = (builder: string) =>
  join(
    dirname(fileURLToPath(import.meta.url)),
    "..",
    "src",
    "builders",
    builder
  );

// Gets a library directory, relative to the current directory.
//-------------------------------------------------------------
export const getLibraryDirectory = (path: string) =>
  join(dirname(fileURLToPath(import.meta.url)), "..", "..", "library", path);

// Checks that all given files are present in all the provided directory.
//-----------------------------------------------------------------------
export const checkFilesExistInPackages = async (
  dir: string,
  files: string[]
) => {
  let valid = true;

  await Promise.all(
    files.map(async (file: string) => {
      try {
        await fs.stat(`${dir}/${file}`);
      } catch (err) {
        console.error(`❌ ${file} not found in ${dir}`);
        valid = false;
      }
    })
  );
  return valid;
};

// Gets a package.json file in the given directory.
//-------------------------------------------------
export const getPackageJson = async (dir: string) => {
  try {
    const file = await fs.readFile(`${dir}/package.json`, "utf-8");
    return JSON.parse(file.toString());
  } catch (err) {
    console.error(`❌ package.json file not found in ${dir}`);
    return undefined;
  }
};

// Remove package output directory if it exists.
// ---------------------------------------------
export const removePackageOutput = async (
  libDirectory: string,
  building: boolean
): Promise<boolean> => {
  try {
    await fs.rm(
      `${libDirectory}/${building ? TEMP_BUILD_OUTPUT : PACKAGE_OUTPUT}`,
      {
        recursive: true,
      }
    );
    return true;
  } catch (err) {
    if (err.code !== "ENOENT") {
      return false;
    }
    return true;
  }
};
