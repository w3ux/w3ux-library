/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import {
  gePackageDirectory,
  getLibraryDirectory,
  getPackageJson,
  getTemplate,
} from 'builders/util'
import { PACKAGE_SCOPE } from 'config'
import fs from 'fs/promises'
import { parse } from 'yaml'

export const build = async () => {
  try {
    const packages = await getPackages()
    
    for (const pkg of packages) {
      await generatePackageReadme(pkg)
    }

    console.log(`✅ Generated README files for ${packages.length} packages successfully.`)
  } catch (err) {
    console.error(`❌ Error occurred while building package READMEs.`, err)
  }
}

// Gets the list of packages
export const getPackages = async () => {
  const packages = await fs.readdir(getLibraryDirectory())
  return packages
}

// Generate README for a single package
export const generatePackageReadme = async (pkg: string) => {
  try {
    const readmePath = `${gePackageDirectory(pkg)}/README.md`
    
    // Check if README already exists and skip if it has custom content
    try {
      const existingReadme = await fs.readFile(readmePath, 'utf-8')
      if (existingReadme && !existingReadme.includes('Part of the [w3ux library]')) {
        console.log(`⏭️ Skipping ${pkg} - custom README exists`)
        return
      }
    } catch (e) {
      // README doesn't exist, continue with generation
    }
    
    const template = await getTemplate('package-readme')
    const packageData = await getPackageData(pkg)
    
    let readmeContent = template
      .replace(/\{\{PACKAGE_NAME\}\}/g, packageData.displayName)
      .replace(/\{\{DESCRIPTION\}\}/g, packageData.description)
      .replace(/\{\{NPM_PACKAGE_NAME\}\}/g, packageData.npmPackageName)
      .replace(/\{\{HOMEPAGE_URL\}\}/g, packageData.homepage || 'https://w3ux.org')
      .replace(/\{\{USAGE_SECTION\}\}/g, packageData.usageSection)
      .replace(/\{\{KEYWORDS\}\}/g, packageData.keywords)
      .replace(/\{\{REPOSITORY_URL\}\}/g, packageData.repositoryUrl)
      .replace(/\{\{NPM_URL\}\}/g, packageData.npmUrl)
      .replace(/\{\{BUGS_URL\}\}/g, packageData.bugsUrl)
      .replace(/\{\{LICENSE\}\}/g, packageData.license)

    await fs.writeFile(readmePath, readmeContent)
    
    console.log(`✅ Generated README for ${packageData.npmPackageName}`)
  } catch (err) {
    console.error(`❌ Error generating README for ${pkg}:`, err)
  }
}

// Get comprehensive package data
export const getPackageData = async (name: string) => {
  let packageInfo: any = {}
  let packageJson: any = {}

  // Try to get data from packageInfo.yml
  try {
    packageInfo = await getSourceIndexYml(name)
  } catch (e) {
    // packageInfo.yml might not exist or be malformed
  }

  // Try to get data from package.json
  try {
    packageJson = await getPackageJson(gePackageDirectory(name))
  } catch (e) {
    // package.json might not exist or be malformed
  }

  const npmPackageName = formatNpmPackageName(name)
  const displayName = packageInfo.directory?.[0]?.name || 
                     packageJson.name?.replace(/-source$/, '').replace('@w3ux/', '') || 
                     name

  const description = packageInfo.directory?.[0]?.description || 
                     packageJson.description || 
                     `Package: ${name}`

  const keywords = packageJson.keywords ? 
                  packageJson.keywords.map((k: string) => `\`${k}\``).join(', ') : 
                  'No keywords available'

  const license = packageJson.license || 'GPL-3.0-only'

  const homepage = packageJson.homepage || `https://w3ux.org/library/${name}`
  
  const repositoryUrl = packageJson.repository?.url?.replace('git+', '').replace('.git', '') || 
                       `https://github.com/w3ux/w3ux-library/tree/main/library/${name}`
  
  const npmUrl = `https://www.npmjs.com/package/${npmPackageName}`
  
  const bugsUrl = packageJson.bugs?.url || 'https://github.com/w3ux/w3ux-library/issues'

  // Generate a basic usage section based on package type
  const usageSection = generateUsageSection(name, npmPackageName, packageJson)

  return {
    displayName,
    description,
    npmPackageName,
    keywords,
    license,
    homepage,
    repositoryUrl,
    npmUrl,
    bugsUrl,
    usageSection
  }
}

// Generate usage section based on package type
export const generateUsageSection = (name: string, npmPackageName: string, packageJson: any): string => {
  // Basic import example for all packages
  let usage = `\`\`\`typescript
import { /* your imports */ } from '${npmPackageName}'
\`\`\``

  // Add specific examples based on package type
  if (name.includes('react') || name.includes('hooks')) {
    usage += `

### React Usage

This package provides React hooks and components. Here's a basic example:

\`\`\`tsx
import React from 'react'
import { /* specific hook or component */ } from '${npmPackageName}'

function MyComponent() {
  // Use the imported hooks or components here
  return <div>Your component content</div>
}
\`\`\``
  }

  if (name.includes('crypto') || name.includes('utils')) {
    usage += `

### Utility Functions

This package provides utility functions that can be used in any JavaScript/TypeScript project:

\`\`\`typescript
import { /* specific function */ } from '${npmPackageName}'

// Use the utility functions
const result = /* call your function */
\`\`\``
  }

  if (name.includes('types')) {
    usage += `

### Type Definitions

This package provides TypeScript type definitions:

\`\`\`typescript
import type { /* specific types */ } from '${npmPackageName}'

// Use the types in your code
interface MyInterface extends /* your type */ {
  // Your interface definition
}
\`\`\``
  }

  if (name.includes('observables')) {
    usage += `

### Observables

This package provides RxJS observables for reactive programming:

\`\`\`typescript
import { /* specific observable */ } from '${npmPackageName}'

// Subscribe to observables
/* your observable */.subscribe(value => {
  console.log(value)
})
\`\`\``
  }

  return usage
}

// Get the source index.yml file for a package
export const getSourceIndexYml = async (name: string) =>
  parse(
    await fs.readFile(`${gePackageDirectory(name)}/packageInfo.yml`, 'utf-8')
  )

// Format the package name to include the package scope
export const formatNpmPackageName = (name: string) =>
  `@${PACKAGE_SCOPE}/${name.replace(/-source$/, '')}`