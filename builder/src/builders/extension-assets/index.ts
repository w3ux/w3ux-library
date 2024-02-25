/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import fs from "fs/promises";
import { join } from "path";
import { PACKAGE_OUTPUT, TEMP_BUILD_OUTPUT } from "config";
import { prebuild } from "builders/common/prebuild";
import { getLibraryDirectory, removePackageOutput } from "builders/utils";
import { AdditionalAsset } from "./types";
import { promisify } from "util";
import { exec } from "child_process";

const execPromisify = promisify(exec);

export const build = async () => {
  const folder = "extension-assets";
  const libDirectory = getLibraryDirectory(folder);

  try {
    // Prebuild integrity checks.
    if (!(await prebuild(folder))) {
      throw `Prebuild failed.`;
    }

    // Create output directory.
    try {
      fs.mkdir(`${libDirectory}/${TEMP_BUILD_OUTPUT}`, { recursive: true });
    } catch (e) {
      throw `Failed to make output directory.`;
    }

    // Generate svg and tsx files from raw source files.
    if (
      !(await generateIcons(
        `${libDirectory}/src/`,
        `${libDirectory}/${TEMP_BUILD_OUTPUT}/`
      ))
    ) {
      throw `Failed to generate icons.`;
    }

    // Use raw info.json files to generate `index.js` file.
    if (
      !(await processIndexFile(
        `${libDirectory}/src/`,
        `${libDirectory}/${TEMP_BUILD_OUTPUT}/`
      ))
    ) {
      throw `Failed to generate index.js file.`;
    }

    // Call tsc command to generate types in dist folder.
    // TODO: generate types from intermediary folder with typed generated files.
    try {
      await execPromisify(`cd ../library/${folder}  && yarn build`);
    } catch (e) {
      console.log(e);
      throw `Failed to generate types.`;
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

// Copy SVG icons from a source directory to the package directory.
const generateIcons = async (
  sourceDir: string,
  destDir: string
): Promise<boolean> => {
  try {
    const subDirs = await fs.readdir(sourceDir);

    for (const subDir of subDirs) {
      const subDirPath = join(sourceDir, subDir);
      const stats = await fs.stat(subDirPath);

      if (stats.isDirectory()) {
        const iconPath = join(subDirPath, "icon.svg");

        try {
          await fs.access(iconPath);
          await generateSvgAssets(iconPath, subDir, destDir);
        } catch (err) {
          // If 'icon.svg' doesn't exist in the subdirectory, ignore it
          if (err.code !== "ENOENT") {
            throw err;
          }
        }
      }
    }

    return true;
  } catch (err) {
    console.error("❌  Error copying icons:", err);
    return false;
  }
};
// Create a React component from an SVG file.
const createReactComponentFromSvg = async (
  svgFilePath: string,
  outputPath: string,
  componentName: string
) => {
  const svgContent = await fs.readFile(svgFilePath, "utf8");
  const reactComponent = generateReactComponent(svgContent, componentName);

  await fs.writeFile(outputPath, reactComponent);
};

// Generates React component markup for an SVG file.
const generateReactComponent = (svgContent: string, componentName: string) => `
export const ${componentName} = () => {
  return (
    ${svgContent}
  );
}

export default ${componentName};
`;

// Generate index file from `info.json` source files.
const processIndexFile = async (
  directoryPath: string,
  outputPath: string
): Promise<boolean> => {
  try {
    const folders = await fs.readdir(directoryPath);
    const indexData = {};

    for (const folder of folders) {
      const folderPath = join(directoryPath, folder);
      const infoPath = join(folderPath, "info.json");

      try {
        const infoContent = await fs.readFile(infoPath, "utf8");
        const info = JSON.parse(infoContent);

        // Get metadata and apply the remaining properties to index data.
        const { id, ...rest } = info;

        if (rest.additionalAssets) {
          await writeAdditionalAssets(
            rest.additionalAssets || [],
            folderPath,
            outputPath
          );
        }

        indexData[id] = rest;
      } catch (error) {
        console.error(
          `❌ Error reading or parsing info.json for folder '${folder}':`,
          error
        );
        return false;
      }
    }

    const indexFileContent = `export const extensions = ${JSON.stringify(indexData, null, 4)};\n\nexport default extensions;`;
    await fs.writeFile(join(outputPath, "index.ts"), indexFileContent);

    return true;
  } catch (error) {
    console.error("❌ Error generating index.ts file:", error);
    return false;
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

// Write additonal assets to package output.
const writeAdditionalAssets = async (
  additionalAssets: AdditionalAsset[],
  inputDir: string,
  outputDir: string
): Promise<boolean> => {
  try {
    // Process each additional asset.
    for (const asset of additionalAssets) {
      const { input, outputFilename } = asset;
      const inputFile = join(inputDir, input);

      await generateSvgAssets(inputFile, outputFilename, outputDir);
    }

    return true;
  } catch (error) {
    console.error("❌ Error copying additional assets:", error);
    return false;
  }
};

// Renames a directory.
// const renameDirectory = async (
//   oldDirPath: string,
//   newDirName: string
// ): Promise<boolean> => {
//   try {
//     // Extract the parent directory path
//     const parentDirPath = dirname(oldDirPath);

//     // Create the new directory path
//     const newDirPath = join(parentDirPath, newDirName);

//     // Rename the directory
//     await fs.rename(oldDirPath, newDirPath);
//     return true;
//   } catch (error) {
//     console.error("❌ Error renaming directory:", error);
//     return false;
//   }
// };

// Generate icons from SVG inputs.
const generateSvgAssets = async (
  inputFile: string,
  outputFilename: string,
  outputDir: string
) => {
  const destFileSvg = join(outputDir, `${outputFilename}.svg`);
  const destFileTsx = join(outputDir, `${outputFilename}.tsx`);

  // Copy SVG file.
  await fs.copyFile(inputFile, destFileSvg);

  // Generate React component from SVG file.
  await createReactComponentFromSvg(inputFile, destFileTsx, outputFilename);
};
