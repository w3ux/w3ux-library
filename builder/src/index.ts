#!/usr/bin/env node
/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { simpleBuild } from 'builders/common/simpleBuild'
import minimist from 'minimist'
import { build as buildDirectory } from './builders/directory'
import { build as buildExtensionAssets } from './builders/extension-assets'

const args = minimist(process.argv.slice(2))

const { t: task } = args

switch (task) {
  case 'crypto':
    await simpleBuild('crypto', { bundler: 'tsup' })
    break

  case 'directory':
    await buildDirectory()
    break

  case 'extension-assets':
    await buildExtensionAssets()
    break

  case 'factories':
    await simpleBuild('factories', { bundler: 'gulp' })
    break

  case 'hooks':
    await simpleBuild('hooks', { bundler: 'gulp' })
    break

  case 'observables-connect':
    await simpleBuild('observables-connect', { bundler: 'gulp' })
    break

  case 'react-connect-kit':
    await simpleBuild('react-connect-kit', { bundler: 'gulp' })
    break

  case 'react-odometer':
    await simpleBuild('react-odometer', { bundler: 'gulp' })
    break

  case 'react-polkicon':
    await simpleBuild('react-polkicon', { bundler: 'gulp' })
    break

  case 'types':
    await simpleBuild('types', { bundler: 'tsup' })
    break

  case 'utils':
    await simpleBuild('utils', { bundler: 'tsup' })
    break

  case 'validator-assets':
    await simpleBuild('validator-assets', { bundler: null })
    break

  default:
    console.log('❌ No task provided.')
}
