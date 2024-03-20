/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import fs from "fs/promises";
import { join, extname } from "path";
import { PACKAGE_OUTPUT, TEMP_BUILD_OUTPUT } from "config";
import { prebuild } from "builders/common/prebuild";
import {
  gePackageDirectory,
  generatePackageJson,
  removePackageOutput,
} from "builders/util";
import { AdditionalAsset } from "./types";
import { promisify } from "util";
import { exec } from "child_process";
import { format } from "prettier";

const execPromisify = promisify(exec);

export const build = async () => {
  const folder = "extension-assets";
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

    // Generate util.ts file.
    await generateUtilFile(
      `${libDirectory}/src/`,
      `${libDirectory}/${TEMP_BUILD_OUTPUT}/`
    );

    // Call tsup command to generate types in dist folder.
    try {
      await execPromisify(`cd ../library/${folder} && yarn build`);
    } catch (e) {
      throw `Failed to generate dist. ${e}`;
    }

    // Copy svg files into the package output directory.
    if (
      !(await moveSvgFiles(
        `${libDirectory}/${TEMP_BUILD_OUTPUT}`,
        `${libDirectory}/${PACKAGE_OUTPUT}`
      ))
    ) {
      throw `Failed to move SVG files to output directory.`;
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

  await fs.writeFile(
    outputPath,
    await format(reactComponent, { parser: "typescript" })
  );
};

// Generates React component markup for an SVG file.
const generateReactComponent = (svgContent: string, componentName: string) => {
  // Replace html attributes with JSX attributes.
  svgContent = svgContent.replace(/fill-rule/g, "fillRule");
  svgContent = svgContent.replace(/stroke-width/g, "strokeWidth");
  svgContent = svgContent.replace(/stop-color/g, "stopColor");
  svgContent = svgContent.replace(/stop-opacity/g, "stopOpacity");
  svgContent = svgContent.replace(/stroke-linejoin/g, "strokeLinejoin");
  svgContent = svgContent.replace(/stroke-linecap/g, "strokeLinecap");
  svgContent = svgContent.replace(/clip-path/g, "clipPath");

  return `
export const ${componentName} = (): JSX.Element => {
  return (
    ${svgContent}
  );
}

export default ${componentName};
`;
};

// Generate index file from `info.json` source files.
const processIndexFile = async (
  directoryPath: string,
  outputPath: string
): Promise<boolean> => {
  try {
    const folders = await fs.readdir(directoryPath);
    const indexData = {};

    for (const folder of folders) {
      try {
        const stats = await fs.stat(`${directoryPath}/${folder}`);
        const isDirectory = stats.isDirectory();

        if (isDirectory) {
          const folderPath = join(directoryPath, folder);
          const infoPath = join(folderPath, "info.json");

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
        }
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

// Generate util file.
const generateUtilFile = async (
  sourceDir: string,
  outputPath: string
): Promise<boolean> => {
  try {
    const filePath = `${outputPath}/util.ts`;
    const imports = [];
    const records = [];

    // Get subdirectories to determine icon files.
    const subDirs = await fs.readdir(sourceDir);

    for (const subDir of subDirs) {
      const stats = await fs.stat(`${sourceDir}/${subDir}`);
      const isDirectory = stats.isDirectory();

      if (isDirectory) {
        // Format import of icon.
        imports.push(`import { ${subDir} } from "./${subDir}";`);

        // Get `id` and format record.
        const infoContent = await fs.readFile(
          `${sourceDir}/${subDir}/info.json`,
          "utf8"
        );
        const { id } = JSON.parse(infoContent);
        records.push(`"${id}": ${subDir}`);
      }
    }

    // Open the file for writing.
    await fs.writeFile(filePath, "");
    const writer = await fs.open(filePath, "w");

    await writer.write(`import { CSSProperties, FC } from "react";\n`);
    for (const line of imports) {
      await writer.write(line + "\n");
    }

    await writer.write(`
    export type ExtensionIcon = FC<{
      style?: CSSProperties;
      className?: string;
    }>;

    export const ExtensionIcons: Record<string, ExtensionIcon> = {\n`);

    for (const line of records) {
      await writer.write(line + ",\n");
    }
    await writer.write("};");

    await writer.write(`
    // Helper: extension icon getter.
    export const getExtensionIcon = (id: string): ExtensionIcon | null =>    
      ExtensionIcons[id] || null;
  `);

    await writer.close();

    // Format the file.
    const data = await fs.readFile(filePath, "utf8");
    const formattedCode = await format(data, { parser: "typescript" });
    await fs.writeFile(filePath, formattedCode, "utf8");

    return true;
  } catch (error) {
    console.error("❌ Error generating util.ts file:", error);
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

// Move svg files from one directory to another directory.
export const moveSvgFiles = async (
  sourceDir: string,
  destinationDir: string
) => {
  try {
    // Read the contents of the source directory
    const files = await fs.readdir(sourceDir);

    // Filter out only SVG files
    const svgFiles = files.filter(
      (file) => extname(file).toLowerCase() === ".svg"
    );
    // Move each SVG file to the destination directory
    await Promise.all(
      svgFiles.map(async (file) => {
        const sourceFilePath = join(sourceDir, file);
        const destinationFilePath = join(destinationDir, file);
        // Move the file
        await fs.rename(sourceFilePath, destinationFilePath);
      })
    );

    return true;
  } catch (err) {
    console.error("❌ Error moving svg Files to output directory:", err);
    return false;
  }
};
