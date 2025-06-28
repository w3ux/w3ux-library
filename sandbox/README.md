# w3ux Library Sandbox

Integration testing sandbox for w3ux library packages.

## Purpose

This sandbox package allows testing w3ux library components and utilities directly from their source files without needing to compile and publish them to npm. This enables:

- Real-time testing of library changes during development
- Integration testing of multiple library packages together
- Testing observables and react-connect-kit modules directly within w3ux
- Prototyping new features before they're finalized

## Setup

The sandbox is configured as a Vite React TypeScript project with path mappings that point directly to the source files of all w3ux library packages:

- `@w3ux/crypto` → `../library/crypto/src`
- `@w3ux/extension-assets` → `../library/extension-assets/src`
- `@w3ux/factories` → `../library/factories/src`
- `@w3ux/hooks` → `../library/hooks/src`
- `@w3ux/observables-connect` → `../library/observables-connect/src`
- `@w3ux/react-connect-kit` → `../library/react-connect-kit/src`
- `@w3ux/react-odometer` → `../library/react-odometer/src`
- `@w3ux/react-polkicon` → `../library/react-polkicon/src`
- `@w3ux/types` → `../library/types/src`
- `@w3ux/utils` → `../library/utils/src`
- `@w3ux/validator-assets` → `../library/validator-assets/src`

## Usage

### Development

```bash
# Start the development server
pnpm run dev

# Open http://localhost:5173 in your browser
```

### Building

```bash
# Build for production
pnpm run build
```

### Testing

You can import any w3ux library module in your sandbox code:

```typescript
import { Polkicon } from '@w3ux/react-polkicon'
import { Odometer } from '@w3ux/react-odometer'
import { isValidAddress, planckToUnit } from '@w3ux/utils'
import { useTimeLeft } from '@w3ux/hooks'
import type { ExtensionAccount } from '@w3ux/types'

// Use them directly in your components
function MyComponent() {
  return (
    <div>
      <Polkicon address="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY" />
      <Odometer value={123} />
    </div>
  )
}
```

## Features Demonstrated

The current sandbox demonstrates:

1. **React Components**
   - Polkicon component for generating Polkadot identicons
   - Odometer component for animated number display

2. **Utility Functions**
   - Address validation (`isValidAddress`)
   - Planck to unit conversion (`planckToUnit`)
   - String ellipsis formatting (`ellipsisFn`)

3. **React Hooks**
   - Time countdown functionality (`useTimeLeft`)

4. **TypeScript Types**
   - Extension account types and other common interfaces

## Benefits

- **No Build Required**: Test library changes immediately without compilation
- **Fast Development**: Hot module replacement works with source files
- **Real Integration**: Test how multiple packages work together
- **Type Safety**: Full TypeScript support with path mappings
- **Easy Testing**: Simple environment for testing new features
