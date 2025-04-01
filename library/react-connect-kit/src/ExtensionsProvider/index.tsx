/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { web3Enable } from '@polkagate/extension-dapp'
import extensions from '@w3ux/extension-assets'
import { createSafeContext } from '@w3ux/hooks'
import type { ExtensionStatus } from '@w3ux/types'
import { setStateWithRef, withTimeout } from '@w3ux/utils'
import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import type { ExtensionsContextInterface } from './types'

export const [ExtensionsContext, useExtensions] =
  createSafeContext<ExtensionsContextInterface>()

export const ExtensionsProvider = ({
  children,
  options,
}: {
  children: ReactNode
  options?: {
    chainSafeSnapEnabled?: boolean
    polkagateSnapEnabled?: boolean
  }
}) => {
  // Store whether initial `injectedWeb3` checking is underway.
  //
  // Injecting `injectedWeb3` is an asynchronous process, so we need to check for its existence for
  // a period of time.
  const [checkingInjectedWeb3, setCheckingInjectedWeb3] =
    useState<boolean>(true)
  const checkingInjectedWeb3Ref = useRef(checkingInjectedWeb3)

  // Store whether injected interval has been initialised.
  const intervalInitialisedRef = useRef<boolean>(false)

  // Store each extension's status in state.
  const [extensionsStatus, setExtensionsStatus] = useState<
    Record<string, ExtensionStatus>
  >({})
  const extensionsStatusRef = useRef(extensionsStatus)

  // Store whether Metamask Snaps are enabled.
  const [polkaGateSnapEnabled] = useState<boolean>(
    options?.polkagateSnapEnabled || false
  )

  // Listen for window.injectedWeb3 with an interval.
  let injectedWeb3Interval: ReturnType<typeof setInterval>
  const injectCounter = useRef<number>(0)

  // Handle completed interval check for `injectedWeb3`.
  //
  // Clear interval and move on to checking for Metamask Polkadot Snap.
  const handleClearInterval = async (hasInjectedWeb3: boolean) => {
    clearInterval(injectedWeb3Interval)

    // Check if Metamask PolkaGate Snap is available.
    if (polkaGateSnapEnabled) {
      await withTimeout(500, web3Enable('snap_only'))

      if (hasInjectedWeb3) {
        setStateWithRef(
          getExtensionsStatus(),
          setExtensionsStatus,
          extensionsStatusRef
        )
      }
    }
    setStateWithRef(false, setCheckingInjectedWeb3, checkingInjectedWeb3Ref)
  }

  // Getter for the currently installed extensions.
  //
  // Loops through the supported extensios and checks if they are present in `injectedWeb3`. Adds
  // `installed` status to the extension if it is present.
  const getExtensionsStatus = () => {
    const { injectedWeb3 } = window
    const newExtensionsStatus = { ...extensionsStatus }
    const extensionsAsArray = Object.entries(extensions).map(
      ([key, value]) => ({
        id: key,
        ...value,
      })
    )
    extensionsAsArray.forEach((e) => {
      if (injectedWeb3[e.id] !== undefined) {
        newExtensionsStatus[e.id] = 'installed'
      }
    })

    return newExtensionsStatus
  }

  // Setter for an extension status.
  const setExtensionStatus = (id: string, status: ExtensionStatus) => {
    setStateWithRef(
      {
        ...extensionsStatusRef.current,
        [id]: status,
      },
      setExtensionsStatus,
      extensionsStatusRef
    )
  }

  // Removes an extension from the `extensionsStatus` state.
  const removeExtensionStatus = (id: string) => {
    const newExtensionsStatus = { ...extensionsStatusRef.current }
    delete newExtensionsStatus[id]

    setStateWithRef(
      newExtensionsStatus,
      setExtensionsStatus,
      extensionsStatusRef
    )
  }

  // Checks if an extension has been installed.
  const extensionInstalled = (id: string): boolean =>
    extensionsStatus[id] !== undefined

  // Checks whether an extension can be connected to.
  const extensionCanConnect = (id: string): boolean =>
    extensionInstalled(id) && extensionsStatus[id] !== 'connected'

  // Checks whether an extension supports a feature.
  const extensionHasFeature = (id: string, feature: string): boolean => {
    const { features } = extensions[id]
    if (features === '*' || features.includes(feature)) {
      return true
    } else {
      return false
    }
  }

  // Check for `injectedWeb3` and Metamask Snap on mount. To trigger interval on soft page
  // refreshes, no empty dependency array is provided to this `useEffect`. Checks for `injectedWeb3`
  // for a total of 3 seconds before giving up.
  //
  // Interval duration.
  const checkEveryMs = 300
  // Total interval iterations.
  const totalChecks = 10
  useEffect(() => {
    if (!intervalInitialisedRef.current) {
      intervalInitialisedRef.current = true

      injectedWeb3Interval = setInterval(() => {
        injectCounter.current++
        if (injectCounter.current === totalChecks) {
          handleClearInterval(false)
        } else {
          // `injectedWeb3` is present
          const injectedWeb3 = window?.injectedWeb3 || null
          if (injectedWeb3 !== null) {
            handleClearInterval(true)
          }
        }
      }, checkEveryMs)
    }

    return () => clearInterval(injectedWeb3Interval)
  })

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
