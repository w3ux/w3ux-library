/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { createSafeContext } from '@w3ux/hooks'
import {
  canConnect,
  extensionsStatus$,
  getStatus,
  gettingExtensions$,
  removeStatus,
  setStatus,
} from '@w3ux/observables-connect'
import { getExtensions } from '@w3ux/observables-connect/extensions'
import type { ExtensionsStatus, ExtensionStatus } from '@w3ux/types'
import { type ReactNode, useEffect, useState } from 'react'
import { combineLatest } from 'rxjs'
import type { ExtensionsContextInterface } from './types'

export const [ExtensionsConnectContext, useExtensions] =
  createSafeContext<ExtensionsContextInterface>()

export const ExtensionsConnectProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  // Store whether extensions are being fetched
  const [gettingExtensions, setGettingExtensions] = useState<boolean>(true)

  // Store discovered extensions along with their status
  const [extensionsStatus, setExtensionsStatus] = useState<ExtensionsStatus>({})

  // Setter for an extension status
  const setExtensionStatus = (id: string, status: ExtensionStatus) => {
    setStatus(id, status)
  }

  // Removes an extension status
  const removeExtensionStatus = (id: string) => {
    removeStatus(id)
  }

  // Checks if an extension has been installed
  const extensionInstalled = (id: string): boolean =>
    getStatus(id) !== undefined

  // Checks whether an extension can be connected to
  const extensionCanConnect = (id: string): boolean => canConnect(id)

  // Subscribes to observables and updates state
  useEffect(() => {
    getExtensions()
    const sub = combineLatest([
      gettingExtensions$,
      extensionsStatus$,
    ]).subscribe(([getting, status]) => {
      setGettingExtensions(getting)
      setExtensionsStatus(status)
    })
    return () => {
      sub.unsubscribe()
    }
  }, [])

  return (
    <ExtensionsConnectContext.Provider
      value={{
        extensionsStatus,
        gettingExtensions,
        setExtensionStatus,
        removeExtensionStatus,
        extensionInstalled,
        extensionCanConnect,
      }}
    >
      {children}
    </ExtensionsConnectContext.Provider>
  )
}
