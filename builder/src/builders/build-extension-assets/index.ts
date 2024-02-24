import {
  PACKAGE_SOURCE_REQUIRED_FILES,
  PACKAGE_SOURCE_REQUIRED_PROPERTIES,
} from "../../config";
import {
  checkFilesExistInPackages,
  getLibraryDirectory,
  getPackageJson,
} from "../utils";

export const build = async () => {
  //--------------------------------------------------
  // Prebuild integrity checks.
  //--------------------------------------------------
  const libDirectory = getLibraryDirectory("extension-assets");

  // Check if required files exist.
  const filesExist = await checkFilesExistInPackages(
    libDirectory,
    PACKAGE_SOURCE_REQUIRED_FILES
  );

  if (!filesExist) {
    console.error(`❌ Some required files are missing in the source package.`);
    return;
  }

  // Get source package.json/
  const sourcePackageJson = await getPackageJson(libDirectory);

  // Get required properties from `package.json`.
  const requiredProperties = Object.entries(sourcePackageJson).filter(
    ([property]) => PACKAGE_SOURCE_REQUIRED_PROPERTIES.includes(property)
  );

  // Check that all required properties were fetched.
  if (requiredProperties.length !== PACKAGE_SOURCE_REQUIRED_PROPERTIES.length) {
    console.error(
      `❌ Some required properties are missing in the source package.json.`
    );
    return;
  }

  try {
    //--------------------------------------------------
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
    //--------------------------------------------------
    // Generate package.json
    //--------------------------------------------------
    // TODO: generate to `PACKAGE_OUTPUT`, using `PACKAGE_SCOPE` and folder name for "name".
  } catch (err) {
    //--------------------------------------------------
    // Tidy up on error.
    //--------------------------------------------------
    console.error(`❌ Error occurred while building the package.`, err);
    // TODO: delete `PACKAGE_OUTPUT` if it was created.
  }
};
