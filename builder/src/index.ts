/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import minimist from 'minimist'
import * as crypto from './builders/crypto'
import * as directory from './builders/directory'
import * as extensionAssets from './builders/extension-assets'
import * as factories from './builders/factories'
import * as hooks from './builders/hooks'
import * as reactConnectKit from './builders/react-connect-kit'
import * as reactOdometer from './builders/react-odometer'
import * as reactPolkicon from './builders/react-polkicon'
import * as types from './builders/types'
import * as utils from './builders/utils'
import * as validatorAssets from './builders/validator-assets'

const args = minimist(process.argv.slice(2))

const { t: task } = args

switch (task) {
  case 'build:directory':
    directory.build()
    break

  case 'build:extension-assets':
    extensionAssets.build()
    break

  case 'build:validator-assets':
    validatorAssets.build()
    break

  case 'build:react-odometer':
    reactOdometer.build()
    break

  case 'build:react-polkicon':
    reactPolkicon.build()
    break

  case 'build:hooks':
    hooks.build()
    break

  case 'build:factories':
    factories.build()
    break

  case 'build:react-connect-kit':
    reactConnectKit.build()
    break

  case 'build:types':
    types.build()
    break

  case 'build:utils':
    utils.build()
    break

  case 'build:crypto':
    crypto.build()
    break

  default:
    console.log('❌ No task provided.')
}
