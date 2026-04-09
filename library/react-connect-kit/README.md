# Connect Kit

Providers and hooks for connecting to web3 wallets and interacting with accounts

## Installation

```bash
npm install @w3ux/react-connect-kit
```

or

```bash
yarn add @w3ux/react-connect-kit
```

or

```bash
pnpm add @w3ux/react-connect-kit
```

## Usage

```tsx
import { ConnectProvider } from '@w3ux/react-connect-kit'

function App() {
  return (
    <ConnectProvider ss58={0} dappName="My Dapp">
      {/* Your app content */}
    </ConnectProvider>
  )
}
```

### Adaptor Model

`ConnectProvider` supports an `adaptors` prop that accepts an array of provider components. Adaptors are dynamically nested inside `ConnectProvider`, allowing your dapp to opt in to whichever connection methods it needs without hard dependencies.

First-party adaptors:

- [`@w3ux/ledger-connect`](https://www.npmjs.com/package/@w3ux/ledger-connect) — Ledger hardware wallet support
- [`@w3ux/vault-connect`](https://www.npmjs.com/package/@w3ux/vault-connect) — Polkadot Vault (QR-based) wallet support

```tsx
import { ConnectProvider } from '@w3ux/react-connect-kit'
import { LedgerAdaptor } from '@w3ux/ledger-connect'
import { VaultAdaptor } from '@w3ux/vault-connect'

function App() {
  return (
    <ConnectProvider
      ss58={0}
      dappName="My Dapp"
      adaptors={[LedgerAdaptor, VaultAdaptor]}
    >
      {/* Your app content */}
    </ConnectProvider>
  )
}
```

Each adaptor provides its own hooks for interacting with its connection method (e.g., `useLedger` from `@w3ux/ledger-connect`). Browser extension connectivity is built in via `useExtensions` and `useExtensionAccounts`.

## Documentation

For comprehensive documentation and examples, visit the [w3ux documentation](https://w3ux.org/library/react-connect-kit/overview).

## Keywords

`w3ux`, `polkadot`, `web3`, `react`, `hooks`, `wallet`, `connect`, `typescript`

## Repository

- **Source**: [GitHub](https://github.com/w3ux/w3ux-library)
- **Package**: [npm](https://www.npmjs.com/package/@w3ux/react-connect-kit)
- **Issues**: [GitHub Issues](https://github.com/w3ux/w3ux-library/issues)

## License

This package is licensed under the GPL-3.0-only.

---

Part of the [w3ux library](https://github.com/w3ux/w3ux-library) - A collection of packages for building Web3 applications.
