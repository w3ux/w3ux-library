import { prebuild } from "../common/prebuild";
export const build = async () => {
  try {
    // Prebuild integrity checks.
    //--------------------------------------------------
    if (!(await prebuild("extension-assets"))) {
      throw `Prebuild failed.`;
    }

    console.log(`✅ Prebuild checks passed.`);

    // Generate package content to PACKAGE_OUTPUT
    //--------------------------------------------------
    // TODO: move raw svg files into `dist/svg/` directory.
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
