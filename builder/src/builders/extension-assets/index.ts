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

    // Move raw svg files into `dist/svg/` directory.
    await copySvgIcons(
      `${libDirectory}/src/`,
      `${libDirectory}/${PACKAGE_OUTPUT}/`
    );

    //
    // TODO: use raw svg files to generate tsx version in `dist/jsx/` directory
    //
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
export const copySvgIcons = async (sourceDir: string, destDir: string) => {
  try {
    const subDirs = await fs.readdir(sourceDir);

    for (const subDir of subDirs) {
      const subDirPath = join(sourceDir, subDir);
      const stats = await fs.stat(subDirPath);

      if (stats.isDirectory()) {
        const iconPath = join(subDirPath, "icon.svg");
        try {
          await fs.access(iconPath);
          const destFile = join(destDir, `${subDir}.svg`);
          await fs.copyFile(iconPath, destFile);
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
