/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

export type Bundler = 'tsup' | 'module'

// TypeScript interfaces for package data structures
export interface PackageInfoYml {
  directory?: Array<{
    name?: string
    description?: string
  }>
}

export interface PackageJson {
  name?: string
  description?: string
  version?: string
  license?: string
  keywords?: string[]
  homepage?: string
  repository?: {
    type?: string
    url?: string
    directory?: string
  }
  bugs?: {
    url?: string
  }
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

export interface PackageData {
  displayName: string
  description: string
  npmPackageName: string
  keywords: string
  license: string
  homepage: string
  repositoryUrl: string
  npmUrl: string
  bugsUrl: string
  usageSection: string
}
