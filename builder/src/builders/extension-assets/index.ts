/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import fs from "fs/promises";
import { join } from "path";
import { PACKAGE_OUTPUT } from "config";
import { prebuild } from "builders/common/prebuild";
import {
  getBuilderDirectory,
  getLibraryDirectory,
  removePackageOutput,
} from "builders/utils";
import { AdditionalAsset } from "./types";

export const build = async () => {
  const folder = "extension-assets";
  const libDirectory = getLibraryDirectory(folder);
  const builderDir = getBuilderDirectory(folder);

  try {
    // Prebuild integrity checks.
    //--------------------------------------------------
    if (!(await prebuild(folder))) {
      throw `Prebuild failed.`;
    }

    // Generate package content to PACKAGE_OUTPUT.
    //--------------------------------------------------

    // Create output directory.
    fs.mkdir(`${libDirectory}/${PACKAGE_OUTPUT}`, { recursive: true });

    // Generate svg and jsx files from raw source files.
    if (
      !(await generateIcons(
        `${libDirectory}/src/`,
        `${libDirectory}/${PACKAGE_OUTPUT}/`
      ))
    ) {
      throw `Failed to generate icons.`;
    }

    // Use raw info.json files to generate `index.js` file.
    if (
      !(await processIndexFile(
        `${libDirectory}/src/`,
        `${libDirectory}/${PACKAGE_OUTPUT}/`
      ))
    ) {
      throw `Failed to generate index.js file.`;
    }

    // Copy types.ts into output directory as index.d.ts.
    await fs.copyFile(
      `${builderDir}/types.ts`,
      `${libDirectory}/${PACKAGE_OUTPUT}/index.d.ts`
    );

    // Generate package.json.
    //--------------------------------------------------
    if (
      !(await generatePackageJson(
        libDirectory,
        `${libDirectory}/${PACKAGE_OUTPUT}`
      ))
    ) {
      throw `Failed to generate package.json file.`;
    }

    console.log(`✅ Package successfully built.`);
  } catch (err) {
    // Handle on error.
    //--------------------------------------------------
    console.error(`❌ Error occurred while building the package.`, err);

    // Remove package output directory if it exists.
    if (!(await removePackageOutput(libDirectory))) {
      console.error(`❌ Failed to remove package output directory.`);
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
          const destFileSvg = join(destDir, `${subDir}.svg`);
          const destFileJsx = join(destDir, `${subDir}.jsx`);

          // Copy SVG file.
          await fs.copyFile(iconPath, destFileSvg);

          // Generate React component from SVG file.
          await createReactComponentFromSvg(iconPath, destFileJsx, subDir);
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
  try {
    const svgContent = await fs.readFile(svgFilePath, "utf8");
    const reactComponent = generateReactComponent(svgContent, componentName);

    await fs.writeFile(outputPath, reactComponent);
  } catch (err) {
    console.error("Error:", err);
  }
};

// Generates React component markup for an SVG file.
const generateReactComponent = (svgContent, componentName) => `
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

    const indexFileContent = `export const Extensions = ${JSON.stringify(indexData, null, 4)};\n`;
    await fs.writeFile(join(outputPath, "index.js"), indexFileContent);

    return true;
  } catch (error) {
    console.error("❌ Error generating index.js file:", error);
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
    const { name, version, license, type, devDependencies } = parsedPackageJson;
    const packageName = name.replace(/-source$/, ""); // Remove '-source' suffix.

    // Construct the minimal package.json object
    const minimalPackageJson = {
      name: packageName,
      version,
      license,
      type,
      devDependencies,
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

      const destFileSvg = join(outputDir, `${outputFilename}.svg`);
      const destFileJsx = join(outputDir, `${outputFilename}.jsx`);

      // Copy SVG file.
      await fs.copyFile(inputFile, destFileSvg);

      // Generate React component from SVG file.
      await createReactComponentFromSvg(inputFile, destFileJsx, outputFilename);
    }

    return true;
  } catch (error) {
    console.error("❌ Error copying additional assets:", error);
    return false;
  }
};
