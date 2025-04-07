/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import extensions from '@w3ux/extension-assets'
import { createSafeContext } from '@w3ux/hooks'
import {
  checkingExtensions$,
  extensionsStatus$,
} from '@w3ux/observables-connect'
import {
  canConnect,
  getExtensions,
  getStatus,
  removeStatus,
  setStatus,
} from '@w3ux/observables-connect/extensions'
import type { ExtensionsStatus, ExtensionStatus } from '@w3ux/types'
import { setStateWithRef } from '@w3ux/utils'
import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { combineLatest } from 'rxjs'
import type { ExtensionsContextInterface } from './types'

export const [ExtensionsContext, useExtensions] =
  createSafeContext<ExtensionsContextInterface>()

export const ExtensionsProvider = ({ children }: { children: ReactNode }) => {
  // Store whether extensions are being checked
  const [checkingInjectedWeb3, setCheckingInjectedWeb3] =
    useState<boolean>(true)
  const checkingInjectedWeb3Ref = useRef(checkingInjectedWeb3)

  // Store discovered extensions along with their status
  const [extensionsStatus, setExtensionsStatus] = useState<ExtensionsStatus>({})
  const extensionsStatusRef = useRef(extensionsStatus)

  // Setter for an extension status
  const setExtensionStatus = (id: string, status: ExtensionStatus) => {
    setStatus(id, status)
  }

  // Removes an extension from the `extensionsStatus` state
  const removeExtensionStatus = (id: string) => {
    removeStatus(id)
  }

  // Checks if an extension has been installed
  const extensionInstalled = (id: string): boolean =>
    getStatus(id) !== undefined

  // Checks whether an extension can be connected to
  const extensionCanConnect = (id: string): boolean => canConnect(id)

  // Checks whether an extension supports a feature.
  const extensionHasFeature = (id: string, feature: string): boolean => {
    const features = extensions[id]?.features || []
    return features === '*' || features.includes(feature)
  }

  // Fetches the extensions and sets the state
  useEffect(() => {
    getExtensions()
    const sub = combineLatest([
      checkingExtensions$,
      extensionsStatus$,
    ]).subscribe(([checking, exts]) => {
      setStateWithRef(
        checking,
        setCheckingInjectedWeb3,
        checkingInjectedWeb3Ref
      )
      setStateWithRef(exts, setExtensionsStatus, extensionsStatusRef)
    })
    return () => {
      sub.unsubscribe()
    }
  }, [])

  return (
    <ExtensionsContext.Provider
      value={{
        extensionsStatus: extensionsStatusRef.current,
        checkingInjectedWeb3,
        setExtensionStatus,
        removeExtensionStatus,
        extensionInstalled,
        extensionCanConnect,
        extensionHasFeature,
      }}
    >
      {children}
    </ExtensionsContext.Provider>
  )
}
