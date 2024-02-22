// ----------------------------
// Package scope to publish to.
// ----------------------------
export const PACKAGE_SCOPE = "w3ux";

// ----------------------------
// Package build output folder.
// ----------------------------
export const PACKAGE_OUTPUT = "dist";

// ----------------------------------------------
// Files that are required to exist in a package.
// ----------------------------------------------
export const PACKAGE_SOURCE_REQUIRED_FILES = [
  "packageInfo.yml",
  "package.json",
  "src",
];

// --------------------------------------------------------------
// Required package.json properties to copy to the package build.
// --------------------------------------------------------------
export const PACKAGE_SOURCE_REQUIRED_PROPERTIES = ["license", "version"];
