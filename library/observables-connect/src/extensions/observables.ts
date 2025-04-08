/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { ExtensionsStatus } from '@w3ux/types'
import { BehaviorSubject } from 'rxjs'

// Discovered extensions along with their status
export const _extensionsStatus = new BehaviorSubject<ExtensionsStatus>({})
export const extensionsStatus$ = _extensionsStatus.asObservable()

// Whether extensions are being checked
export const _gettingExtensions = new BehaviorSubject<boolean>(true)
export const gettingExtensions$ = _gettingExtensions.asObservable()

// Extensions that have successfully connected
export const _initialisedExtensions = new BehaviorSubject<string[]>([])
export const initialisedExtensions$ = _initialisedExtensions.asObservable()
