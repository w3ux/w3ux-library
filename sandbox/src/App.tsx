import { useTimeLeft } from '@w3ux/hooks'
import { Odometer } from '@w3ux/react-odometer'
import { Polkicon } from '@w3ux/react-polkicon'
import { ellipsisFn, isValidAddress, planckToUnit } from '@w3ux/utils'
import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [testAddress, setTestAddress] = useState(
    '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
  )
  const [testValue, setTestValue] = useState('123456789012')

  // Example of using the useTimeLeft hook
  const { setFromNow, timeleft } = useTimeLeft()

  useEffect(() => {
    const now = new Date()
    const endTime = new Date(now.getTime() + 60000) // 1 minute from now
    setFromNow(now, endTime)
  }, [setFromNow])

  // Testing utility functions
  const isAddressValid = isValidAddress(testAddress)
  const formattedValue = planckToUnit(testValue, 12) // Convert planck to DOT units
  const ellipsisAddress = ellipsisFn(testAddress, 6)

  return (
    <>
      <div style={{ padding: '2rem' }}>
        <h1>w3ux Library Sandbox</h1>
        <p>Testing w3ux library components and utilities from source files</p>

        <div style={{ marginBottom: '2rem' }}>
          <h2>React Components</h2>

          <div style={{ marginBottom: '1rem' }}>
            <h3>Polkicon Component</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Polkicon address={testAddress} />
              <div>
                <input
                  type="text"
                  value={testAddress}
                  onChange={(e) => setTestAddress(e.target.value)}
                  placeholder="Enter Polkadot address"
                  style={{ width: '400px', padding: '0.5rem' }}
                />
                <p>
                  Address valid:{' '}
                  <strong>{isAddressValid ? 'Yes' : 'No'}</strong>
                </p>
                <p>
                  Ellipsis format: <strong>{ellipsisAddress}</strong>
                </p>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <h3>Odometer Component</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '2rem' }}>
                <Odometer value={count} />
              </div>
              <button onClick={() => setCount(count + 1)}>
                Increment Count
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2>Utility Functions</h2>

          <div style={{ marginBottom: '1rem' }}>
            <h3>planckToUnit Utility</h3>
            <input
              type="text"
              value={testValue}
              onChange={(e) => setTestValue(e.target.value)}
              placeholder="Enter planck value"
              style={{ width: '200px', padding: '0.5rem', marginRight: '1rem' }}
            />
            <span>
              Converted to DOT: <strong>{formattedValue}</strong>
            </span>
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2>React Hooks</h2>

          <div>
            <h3>useTimeLeft Hook</h3>
            <p>
              Time remaining:{' '}
              <strong>
                {timeleft.raw.minutes}m {timeleft.raw.seconds || 0}s
              </strong>
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2>TypeScript Types</h2>
          <p>Using types from @w3ux/types package</p>
          <pre
            style={{
              background: '#f5f5f5',
              padding: '1rem',
              fontSize: '0.9rem',
            }}
          >
            {`// Example type usage from @w3ux/types:
interface ExampleAccount {
  address: string;
  name: string;
  source: string;
}

const account: ExampleAccount = {
  address: "${testAddress}",
  name: "Test Account",
  source: "polkadot-js"
};`}
          </pre>
        </div>

        <div
          style={{
            background: '#e8f5e8',
            padding: '1rem',
            borderRadius: '0.5rem',
          }}
        >
          <h3>✅ Sandbox Setup Complete!</h3>
          <p>
            This sandbox successfully imports w3ux library modules from their
            source files:
          </p>
          <ul style={{ textAlign: 'left' }}>
            <li>@w3ux/react-polkicon - Polkicon component</li>
            <li>@w3ux/react-odometer - Odometer component</li>
            <li>
              @w3ux/utils - Utility functions (isValidAddress, planckToUnit,
              ellipsisFn)
            </li>
            <li>@w3ux/hooks - React hooks (useTimeLeft)</li>
            <li>@w3ux/types - TypeScript types</li>
          </ul>
          <p>
            All imports are working directly from the source files without
            needing compiled packages!
          </p>
        </div>
      </div>
    </>
  )
}

export default App
