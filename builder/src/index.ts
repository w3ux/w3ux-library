#!/usr/bin/env node
/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { simpleBuild } from 'builders/common/simpleBuild'
import minimist from 'minimist'
import { build as buildDirectory } from './builders/directory'
import { build as buildExtensionAssets } from './builders/extension-assets'
import { build as buildPackageReadmes } from './builders/package-readme'

const args = minimist(process.argv.slice(2))

const { t: task } = args

switch (task) {
	case 'crypto':
		await simpleBuild('crypto')
		break

	case 'directory':
		await buildDirectory()
		break

	case 'extension-assets':
		await buildExtensionAssets()
		break

	case 'package-readmes':
		await buildPackageReadmes()
		break

	case 'factories':
		await simpleBuild('factories')
		break

	case 'hooks':
		await simpleBuild('hooks')
		break

	case 'observables-connect':
		await simpleBuild('observables-connect')
		break

	case 'react-connect-kit':
		await simpleBuild('react-connect-kit')
		break

	case 'react-odometer':
		await simpleBuild('react-odometer')
		break

	case 'react-polkicon':
		await simpleBuild('react-polkicon')
		break

	case 'types':
		await simpleBuild('types')
		break

	case 'util-dedot':
		await simpleBuild('util-dedot')
		break

	case 'utils':
		await simpleBuild('utils')
		break

	case 'validator-assets':
		await simpleBuild('validator-assets')
		break

	default:
		console.log('❌ No task provided.')
}
