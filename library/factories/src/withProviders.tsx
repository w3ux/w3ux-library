/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { FC } from "react";

// `providers` accepts standalone functional components or an array of a functional component and its props.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Provider = FC<any> | [FC<any>, any];

// A pure function that applies an arbitrary amount of context providers to a wrapped component.
export const withProviders = (providers: Provider[], Wrapped: FC) =>
  providers.reduceRight(
    (acc, prov) => {
      if (Array.isArray(prov)) {
        const Provider = prov[0];
        return <Provider {...prov[1]}>{acc}</Provider>;
      }
      const Provider = prov;
      return <Provider>{acc}</Provider>;
    },
    <Wrapped />
  );
