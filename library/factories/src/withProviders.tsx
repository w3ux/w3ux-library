/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import type { FC } from "react";

// `providers` accepts standalone functional components or an array of a functional component and its props.
export type Provider<T> = FC<T> | [FC<T>, T];

// A higher-order component that wraps a specified React component (Wrapped) with multiple context
// providers. Each provider can either be a standalone component or a component with specified
// props. The first provider in the array becomes the outermost wrapper in the rendered output.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const withProviders = (providers: Provider<any>[], Wrapped: FC) =>
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
