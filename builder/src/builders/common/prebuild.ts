import {
  checkFilesExistInPackages,
  getLibraryDirectory,
  getPackageJson,
  removePackageOutput,
} from "../utils";
import {
  PACKAGE_SOURCE_REQUIRED_FILES,
  PACKAGE_SOURCE_REQUIRED_PROPERTIES,
} from "config";

export const prebuild = async (folder: string): Promise<boolean> => {
  const libDirectory = getLibraryDirectory(folder);

  // Check if required files exist.
  const filesExist = await checkFilesExistInPackages(
    libDirectory,
    PACKAGE_SOURCE_REQUIRED_FILES
  );

  if (!filesExist) {
    console.error(`❌ Some required files are missing in the source package.`);
    return false;
  }

  // Get source package.json.
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
    return false;
  }

  // Remove package output directory if it exists.
  if (!(await removePackageOutput(libDirectory))) {
    console.error(`❌ Failed to remove package output directory.`);
    return false;
  }

  return true;
};
