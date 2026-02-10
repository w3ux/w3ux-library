# Dedot Utils

Utilities for working with Substrate accounts using `dedot`.

## Installation

```bash
npm install @w3ux/util-dedot
```

or

```bash
yarn add @w3ux/util-dedot
```

or

```bash
pnpm add @w3ux/util-dedot
```

## Usage

```typescript
import { formatAccountSs58, isValidAddress } from '@w3ux/util-dedot'
```

### Account Helpers

Validate Substrate addresses and format them to a target `ss58` prefix:

```typescript
import { formatAccountSs58, isValidAddress } from '@w3ux/util-dedot'

const address = '5D4k...'

if (isValidAddress(address)) {
	const kusamaAddress = formatAccountSs58(address, 2)
	console.log(kusamaAddress)
}
```

### API

- `formatAccountSs58(address, ss58)`: Returns the address encoded with the supplied `ss58` prefix, or `null` when invalid.
- `isValidAddress(address)`: Returns `true` when the address is a valid Substrate address.

## Documentation

For comprehensive documentation and examples, visit the [w3ux documentation](https://w3ux.org/library/util-dedot).

## Keywords

`w3ux`, `polkadot`, `web3`, `dedot`, `ss58`, `accounts`, `typescript`

## Repository

- **Source**: [GitHub](https://github.com/w3ux/w3ux-library)
- **Package**: [npm](https://www.npmjs.com/package/@w3ux/util-dedot)
- **Issues**: [GitHub Issues](https://github.com/w3ux/w3ux-library/issues)

## License

This package is licensed under the GPL-3.0-only.

---

Part of the [w3ux library](https://github.com/w3ux/w3ux-library) - A collection of packages for building Web3 applications.
