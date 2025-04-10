/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { PACKAGE_OUTPUT, TEMP_BUILD_OUTPUT } from 'config'
import fs from 'fs/promises'
import { dirname, join } from 'path'
import type { Bundler } from 'types'
import { fileURLToPath } from 'url'

// Gets workspace directory from the current directory
export const getWorkspaceDirectory = () =>
  join(dirname(fileURLToPath(import.meta.url)), '..', '..')

// Gets builder source directory, relative to  the builder's dist directory
export const getBuilderDirectory = () =>
  join(dirname(fileURLToPath(import.meta.url)), '..', 'src')

// Gets library directory, relative to the current directory
export const getLibraryDirectory = () =>
  join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'library')

// Gets a package directory, relative to the current directory
export const gePackageDirectory = (path: string) =>
  join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'library', path)

// Checks that all given files are present in all the provided directory
export const checkFilesExistInPackages = async (
  dir: string,
  files: string[]
) => {
  let valid = true

  await Promise.all(
    files.map(async (file: string) => {
      try {
        await fs.stat(`${dir}/${file}`)
      } catch (err) {
        console.error(`❌ ${file} not found in ${dir}`)
        valid = false
      }
    })
  )
  return valid
}

// Gets a package.json file in the given directory
export const getPackageJson = async (dir: string) => {
  try {
    const file = await fs.readFile(`${dir}/package.json`, 'utf-8')
    return JSON.parse(file.toString())
  } catch (err) {
    console.error(`❌ package.json file not found in ${dir}`)
    return undefined
  }
}

// Remove package output directory if it exists
export const removePackageOutput = async (
  libDirectory: string,
  building: boolean
): Promise<boolean> => {
  try {
    await fs.rm(
      `${libDirectory}/${building ? TEMP_BUILD_OUTPUT : PACKAGE_OUTPUT}`,
      {
        recursive: true,
      }
    )
    return true
  } catch (err) {
    if (err.code !== 'ENOENT') {
      return false
    }
    return true
  }
}

// Get a source template file for the directory
export const getTemplate = async (name) => {
  const file = await fs.readFile(
    `${getBuilderDirectory()}/templates/${name}.md`,
    'utf-8'
  )
  return file.toString()
}

// Generate package package.json file from source package.json
export const generatePackageJson = async (
  inputDir: string,
  outputDir: string,
  bundler: Bundler | null,
  additionalExports: Record<
    string,
    {
      import: string
      require: string
    }
  > = {}
): Promise<boolean> => {
  try {
    // Read the original package.json.
    const parsedPackageJson = JSON.parse(
      await fs.readFile(join(inputDir, 'package.json'), 'utf8')
    )

    // Extract only the specified fields.
    const { name, version, license, dependencies, peerDependencies } =
      parsedPackageJson
    const packageName = name.replace(/-source$/, '') // Remove '-source' suffix.

    // Attempt to get exports
    let exportsJson
    try {
      exportsJson = JSON.parse(
        await fs.readFile(join(inputDir, 'exports.config.json'), 'utf8')
      )
    } catch (e) {
      // Silenty fail getting exports
    }

    // Construct the minimal package.json object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let minimalPackageJson: any = {
      name: packageName,
      version,
      license,
      type: 'module',
    }

    if (bundler === 'gulp') {
      minimalPackageJson = {
        ...minimalPackageJson,
        exports: exportsJson?.exports || {
          '.': {
            import: './mjs/index.js',
            require: './cjs/index.js',
          },
          ...additionalExports,
        },
      }
    }

    if (bundler === 'tsup') {
      minimalPackageJson = {
        ...minimalPackageJson,
        exports: exportsJson?.exports || {
          '.': {
            import: './index.js',
            require: './index.cjs',
          },
          ...additionalExports,
        },
      }
    }

    if (dependencies) {
      minimalPackageJson['dependencies'] = dependencies
    }
    if (peerDependencies) {
      minimalPackageJson['peerDependencies'] = peerDependencies
    }

    // Write the minimal package.json to the output directory.
    const outputPath = join(outputDir, 'package.json')
    await fs.writeFile(outputPath, JSON.stringify(minimalPackageJson, null, 2))

    return true
  } catch (error) {
    console.error('❌ Error generating minimal package.json:', error)
    return false
  }
}
