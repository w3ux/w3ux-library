/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

// Package scope to publish to
export const PACKAGE_SCOPE = 'w3ux'

// Temporary build folder name
export const TEMP_BUILD_OUTPUT = '.build'

// Package build output folder
export const PACKAGE_OUTPUT = 'dist'

// Files that are required to exist in a package
export const PACKAGE_SOURCE_REQUIRED_FILES = ['packageInfo.yml', 'package.json']

// Required dist package.json properties
export const PACKAGE_SOURCE_REQUIRED_PROPERTIES = ['license', 'version']
