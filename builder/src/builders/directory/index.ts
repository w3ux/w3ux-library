/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import {
  gePackageDirectory,
  getLibraryDirectory,
  getTemplate,
  getWorkspaceDirectory,
} from 'builders/util'
import { PACKAGE_SCOPE } from 'config'
import fs from 'fs/promises'
import { parse } from 'yaml'

export const build = async () => {
  try {
    const packages = await getPackages()

    // Open file to get directory header.
    // ----------------------------------
    let data = await getTemplate('directory')

    for (const pkg of packages) {
      // Create package directory title and description.
      // -----------------------------------------------
      data += formatDirectoryHeaders(pkg)

      // Format directory data from package `index.yml`.
      // -----------------------------------------------
      const { directory } = await getSourceIndexYml(pkg)

      // Append the directory entries.
      // -----------------------------
      data += formatDirectoryEntry(directory)
    }

    // Write to docs/README.md.
    // ------------------------
    await fs.writeFile(`${getWorkspaceDirectory()}/README.md`, data)

    console.log('✅ Generated directory successfully.')
  } catch (err) {
    console.error(`❌ Error occurred while building directory.`, err)
  }
}

// Gets the list of packges.
export const getPackages = async () => {
  const packages = await fs.readdir(getLibraryDirectory())
  return packages
}

// Format the package introduction data in the README file.
export const formatDirectoryHeaders = (pkg: string) =>
  '\n#### `' +
  formatNpmPackageName(pkg) +
  '`&nbsp; [[npm](https://www.npmjs.com/package/' +
  formatNpmPackageName(pkg) +
  ')' +
  '&nbsp;|&nbsp; [source](https://github.com/w3ux/w3ux-library/tree/main/library/' +
  pkg +
  ')]\n'

// Format the package name to include the package scope.
export const formatNpmPackageName = (name: string) =>
  `@${PACKAGE_SCOPE}/${name.replace(/-source$/, '')}`

// Get the source index.yml file for a package.
export const getSourceIndexYml = async (name: string) =>
  parse(
    await fs.readFile(`${gePackageDirectory(name)}/packageInfo.yml`, 'utf-8')
  )

// Format the package content data in the README file.
export const formatDirectoryEntry = (
  directory: { name: string; description: string }[]
) =>
  directory.reduce(
    (str: string, { description }) => str + '\n' + description + '\n',
    ''
  )
