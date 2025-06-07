/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import {
  gePackageDirectory,
  getLibraryDirectory,
  getPackageJson,
  getTemplate,
  getWorkspaceDirectory,
} from 'builders/util'
import { PACKAGE_SCOPE } from 'config'
import fs from 'fs/promises'
import { parse } from 'yaml'

export const build = async () => {
  try {
    const packages = await getPackages()
    let data = await getTemplate('directory')

    for (const pkg of packages) {
      data += formatDirectoryHeaders(pkg)
      const description = await getPackageDescription(pkg)
      data += formatDirectoryEntry(description)
    }

    await fs.writeFile(`${getWorkspaceDirectory()}/README.md`, data)

    console.log('✅ Generated directory successfully.')
  } catch (err) {
    console.error(`❌ Error occurred while building directory.`, err)
  }
}

// Gets the list of packges
export const getPackages = async () => {
  const packages = await fs.readdir(getLibraryDirectory())
  return packages
}

// Format the package introduction data in the README file
export const formatDirectoryHeaders = (pkg: string) =>
  '\n#### `' +
  formatNpmPackageName(pkg) +
  '`&nbsp; [[npm](https://www.npmjs.com/package/' +
  formatNpmPackageName(pkg) +
  ')' +
  '&nbsp;|&nbsp; [source](https://github.com/w3ux/w3ux-library/tree/main/library/' +
  pkg +
  ')]\n'

// Format the package name to include the package scope
export const formatNpmPackageName = (name: string) =>
  `@${PACKAGE_SCOPE}/${name.replace(/-source$/, '')}`

// Get package description from packageInfo.yml or fallback to package.json
export const getPackageDescription = async (name: string): Promise<string> => {
  try {
    // Try to get description from packageInfo.yml first
    const packageInfo = await getSourceIndexYml(name)
    if (packageInfo.directory && packageInfo.directory[0]?.description) {
      return packageInfo.directory[0].description
    }
  } catch (e) {
    // packageInfo.yml might not exist or be malformed
  }

  try {
    // Fallback to package.json description
    const packageJson = await getPackageJson(gePackageDirectory(name))
    if (packageJson.description) {
      return packageJson.description
    }
  } catch (e) {
    // package.json might not exist or be malformed
  }

  // Final fallback
  return `Package: ${name}`
}

// Get the source index.yml file for a package
export const getSourceIndexYml = async (name: string) =>
  parse(
    await fs.readFile(`${gePackageDirectory(name)}/packageInfo.yml`, 'utf-8')
  )

// Format the package content data in the README file
export const formatDirectoryEntry = (description: string) =>
  '\n' + description + '\n'
