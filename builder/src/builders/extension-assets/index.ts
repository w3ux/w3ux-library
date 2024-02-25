import fs from "fs/promises";
import { join } from "path";
import { PACKAGE_OUTPUT } from "config";
import { prebuild } from "builders/common/prebuild";
import { getLibraryDirectory } from "builders/utils";

export const build = async () => {
  try {
    const folder = "extension-assets";

    // Prebuild integrity checks.
    //--------------------------------------------------
    if (!(await prebuild(folder))) {
      throw `Prebuild failed.`;
    }

    console.log(`✅ Prebuild checks passed.`);

    // Generate package content to PACKAGE_OUTPUT
    //--------------------------------------------------

    const libDirectory = getLibraryDirectory(folder);

    // Create output directory.
    fs.mkdir(`${libDirectory}/${PACKAGE_OUTPUT}`, { recursive: true });

    // Generate svg and jsx files from raw source files.
    await generateIcons(
      `${libDirectory}/src/`,
      `${libDirectory}/${PACKAGE_OUTPUT}/`
    );

    // TODO: use raw `info.json` files to generate `dist/index.js` file.
    //
    // TODO: plug in helper functions `ExtensionsArray` and `ExtensionIcons`. Import icons, then
    // generate markup.
    //
    // Generate package.json
    //--------------------------------------------------
    // TODO: generate to `PACKAGE_OUTPUT`, using `PACKAGE_SCOPE` and folder name for "name".
  } catch (err) {
    // Tidy up on error.
    //--------------------------------------------------
    console.error(`❌ Error occurred while building the package.`, err);
    // TODO: delete `PACKAGE_OUTPUT` if it was created.
  }
};

// Copy SVG icons from a source directory to the package directory.
const generateIcons = async (sourceDir: string, destDir: string) => {
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
  } catch (err) {
    console.error("❌  Error copying icons:", err);
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
const generateReactComponent = (
  svgContent: string,
  componentName = "SvgComponent"
) => `function ${componentName}() {
  return (
    ${svgContent}
  );
}

export default ${componentName};
`;
