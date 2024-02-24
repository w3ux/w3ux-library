// Package scope to publish to.
// --------------------------------------------------
export const PACKAGE_SCOPE = "w3ux";

// Package build output folder.
// --------------------------------------------------
export const PACKAGE_OUTPUT = "dist";

// Files that are required to exist in a package.
// --------------------------------------------------
export const PACKAGE_SOURCE_REQUIRED_FILES = [
  "packageInfo.yml",
  "package.json",
];

// Required dist package.json properties.
// --------------------------------------------------
export const PACKAGE_SOURCE_REQUIRED_PROPERTIES = ["license", "version"];
