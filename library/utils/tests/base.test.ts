/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { describe, expect, test } from 'vitest'
import type * as fn from '../src/index'
import type { AnyObject } from '../src/types'

const address = '234CHvWmTuaVtkJpLS9oxuhFd3HamcEMrfFAPYoFaetEZmY7'

// Test suite for the `minDecimalPlaces` function.
describe('minDecimalPlaces', () => {
  test('should add trailing zeros to meet the minimum decimal places', () => {
    const result = fn.minDecimalPlaces('10.5', 4)
    expect(result).toEqual('10.5000')
  })

  test('should not change the value if it already has more decimal places than the minimum', () => {
    const result = fn.minDecimalPlaces('8.123456789', 5)
    expect(result).toEqual('8.123456789')
  })

  test('should add zeros if the input has no decimal part', () => {
    const result = fn.minDecimalPlaces('42', 3)
    expect(result).toEqual('42.000')
  })

  test('should handle a zero input', () => {
    const result = fn.minDecimalPlaces('0', 2)
    expect(result).toEqual('0.00')
  })

  test('should handle negative input with trailing zeros', () => {
    const result = fn.minDecimalPlaces('-123.0000', 4)
    expect(result).toEqual('-123.0000')
  })

  test('should keep inputs that have commas', () => {
    const result = fn.minDecimalPlaces('8,452', 5)
    expect(result).toEqual('8,452.00000')
  })

  test('should not change the value if it already has more decimal places than the minimum', () => {
    const result = fn.minDecimalPlaces('8.123456789', 5)
    expect(result).toEqual('8.123456789')
  })

  test('should pad with zeros if the value has fewer decimal places than the minimum', () => {
    const result = fn.minDecimalPlaces('8.1', 3)
    expect(result).toEqual('8.100')
  })

  test('should not add any padding if the value has exactly the minimum decimal places', () => {
    const result = fn.minDecimalPlaces('8.123', 3)
    expect(result).toEqual('8.123')
  })

  test('should handle numbers with commas and retain them in the output', () => {
    const result = fn.minDecimalPlaces('1,234.5', 3)
    expect(result).toEqual('1,234.500')
  })

  test('should handle number input without commas', () => {
    const result = fn.minDecimalPlaces(1234.5, 2)
    expect(result).toEqual('1234.50')
  })

  test('should handle BigInt input and add decimal places', () => {
    const result = fn.minDecimalPlaces(123456789n, 5)
    expect(result).toEqual('123456789.00000')
  })

  test('should handle zero as input and pad to the specified decimal places', () => {
    const result = fn.minDecimalPlaces('0', 4)
    expect(result).toEqual('0.0000')
  })

  test('should handle a large BigInt input without modifying integer part', () => {
    const result = fn.minDecimalPlaces(100000000000000000000n, 3)
    expect(result).toEqual('100000000000000000000.000')
  })

  test('should handle a large comma formatted string input without modifying integer part', () => {
    const result = fn.minDecimalPlaces('100,000,000,000,000,000,000', 3)
    expect(result).toEqual('100,000,000,000,000,000,000.000')
  })

  test("should return '0' for invalid input", () => {
    const result = fn.minDecimalPlaces('invalid', 2)
    expect(result).toEqual('0')
  })
})

describe('Tests suite - rmCommas Function', () => {
  test('should remove all commas from a string with commas', () => {
    const inputValue = '1,000,000'
    const expectedOutput = '1000000'
    const result = fn.rmCommas(inputValue)
    expect(result).toBe(expectedOutput)
  })

  test('should return the same string when there are no commas', () => {
    const inputValue = '12345'
    const expectedOutput = '12345'
    const result = fn.rmCommas(inputValue)
    expect(result).toBe(expectedOutput)
  })

  test('should return an empty string when the input is empty', () => {
    const inputValue = ''
    const expectedOutput = ''
    const result = fn.rmCommas(inputValue)
    expect(result).toBe(expectedOutput)
  })
})

describe('rmDecimals', () => {
  test('should remove decimals from a string with a decimal point', () => {
    expect(fn.rmDecimals('123.45')).toBe('123')
    expect(fn.rmDecimals('45.6789')).toBe('45')
  })

  test('should return the original string if no decimal point exists', () => {
    expect(fn.rmDecimals('678')).toBe('678')
    expect(fn.rmDecimals('123')).toBe('123')
  })

  test('should handle empty strings', () => {
    expect(fn.rmDecimals('')).toBe('')
  })

  test('should handle strings with multiple decimal points by removing everything after the first', () => {
    expect(fn.rmDecimals('123.45.67')).toBe('123')
  })

  test('should handle strings with only a decimal point', () => {
    expect(fn.rmDecimals('.')).toBe('')
  })

  test('should handle strings that start with a decimal point', () => {
    expect(fn.rmDecimals('.123')).toBe('')
  })

  test('should handle strings with non-numeric characters', () => {
    expect(fn.rmDecimals('abc.123')).toBe('abc')
    expect(fn.rmDecimals('test.')).toBe('test')
  })
})

describe('Test suite - shuffle Function', () => {
  test('should shuffle an array of numbers', () => {
    const inputArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    const shuffledArray = fn.shuffle([...inputArray])
    expect(shuffledArray).not.toEqual(inputArray)
    expect(shuffledArray).toEqual(expect.arrayContaining(inputArray))
    expect(shuffledArray.length).toBe(inputArray.length)
  })

  test('should shuffle an array of strings', () => {
    const inputArray = [
      'apple',
      'banana',
      'cherry',
      'date',
      'fig',
      '1',
      '25',
      '13',
      '47',
      '05',
    ]
    const shuffledArray = fn.shuffle([...inputArray])
    expect(shuffledArray).not.toStrictEqual(inputArray)
    expect(shuffledArray).toStrictEqual(expect.arrayContaining(inputArray))
    expect(shuffledArray.length).toBe(inputArray.length)
  })

  test('should shuffle an empty array', () => {
    const inputArray: number[] = []
    const shuffledArray = fn.shuffle([...inputArray])
    expect(shuffledArray).toEqual([])
  })

  test('should shuffle an array with a single element', () => {
    const inputArray = [42]
    const shuffledArray = fn.shuffle([...inputArray])
    expect(shuffledArray).toEqual(inputArray)
  })
})

describe('Tests suite - pageFromUri Function', () => {
  test('should extract the page from a pathname with a valid page name', () => {
    const pathname = '/products/detail'
    const fallback = 'home'
    const result = fn.pageFromUri(pathname, fallback)
    expect(result).toBe('detail')
  })

  test('should extract the page from a pathname with a valid page name', () => {
    // attention on the extra space at the end of the pathname
    const pathname = '/products/detail '
    const fallback = 'home'
    const result = fn.pageFromUri(pathname, fallback)
    expect(result).toBe('detail')
  })

  test('should use the fallback when the pathname is empty', () => {
    const pathname = ''
    const fallback = 'home'
    const result = fn.pageFromUri(pathname, fallback)
    expect(result).toBe(fallback)
  })

  test('should use the fallback when the pathname ends with a trailing slash', () => {
    const pathname = '/categories/'
    const fallback = 'home'
    const result = fn.pageFromUri(pathname, fallback)
    expect(result).toBe(fallback)
  })

  test('should handle a pathname with spaces and return the page without spaces', () => {
    const pathname = '/about us'
    const fallback = 'home'
    const result = fn.pageFromUri(pathname, fallback)
    expect(result).toBe('about us')
  })

  test('should handle a pathname with special characters and return the page as-is', () => {
    const pathname = '/products/detail#section'
    const fallback = 'home'
    const result = fn.pageFromUri(pathname, fallback)
    expect(result).toBe('detail#section')
  })
})

describe('Tests suite - capitalizeFirstLetter Function', () => {
  test('should capitalize the first letter of a lowercase string', () => {
    const input = 'hello'
    const result = fn.capitalizeFirstLetter(input)
    expect(result).toBe('Hello')
  })

  test('should not change the string if the first letter is already capitalized', () => {
    const input = 'World'
    const result = fn.capitalizeFirstLetter(input)
    expect(result).toBe('World')
  })

  test('should handle empty strings', () => {
    const input = ''
    const result = fn.capitalizeFirstLetter(input)
    expect(result).toBe('')
  })

  test('should handle strings with only one character', () => {
    const input = 'a'
    const result = fn.capitalizeFirstLetter(input)
    expect(result).toBe('A')
  })

  test('should handle strings with special characters', () => {
    const input = '@test'
    const result = fn.capitalizeFirstLetter(input)
    expect(result).toBe('@test')
  })
})

describe('Tests suite - camelize Function', () => {
  test('should camelize a basic string', () => {
    const input = 'hello_world'
    const result = fn.camelize(input)
    expect(result).toBe('helloWorld')
  })

  test('should camelize a string with spaces', () => {
    const input = 'hello world'
    const result = fn.camelize(input)
    expect(result).toBe('helloWorld')
  })

  test('should camelize a string with mixed case', () => {
    const input = 'HeLLo WoRLD'
    const result = fn.camelize(input)

    // This is due to the fact that Capital letters identify as
    // "beginning of a word"
    expect(result).toBe('heLLoWoRld')
  })

  test('should camelize an empty string', () => {
    const input = ''
    const result = fn.camelize(input)
    expect(result).toBe('')
  })

  test('should camelize a single-word string', () => {
    const input = 'camelCase'
    const result = fn.camelize(input)
    expect(result).toBe('camelCase')
  })

  test('should camelize a string with leading whitespace', () => {
    const input = '   leadingWhitespace'
    const result = fn.camelize(input)
    expect(result).toBe('leadingWhitespace')
  })

  test('should camelize a string with trailing whitespace', () => {
    const input = 'trailingWhitespace   '
    const result = fn.camelize(input)
    expect(result).toBe('trailingWhitespace')
  })

  test('should camelize a string with multiple spaces', () => {
    const input = '   multiple   spaces   '
    const result = fn.camelize(input)
    expect(result).toBe('multipleSpaces')
  })
})

describe('Test suite - sortWithNull Function', () => {
  test('should sort an array of numbers in ascending order with nulls last', () => {
    const ascendingSort = fn.sortWithNull(true)
    const inputArray = [null, 3, 1, null, 2, 4]
    const sortedArray = inputArray.sort(ascendingSort)
    expect(sortedArray).toEqual([1, 2, 3, 4, null, null])
  })

  test('should sort an array of strings in descending order with nulls first', () => {
    const descendingSort = fn.sortWithNull(false)
    const inputArray = ['apple', null, 'banana', 'cherry', null, 'date']
    const sortedArray = inputArray.sort(descendingSort)
    expect(sortedArray).toEqual([
      'date',
      'cherry',
      'banana',
      'apple',
      null,
      null,
    ])
  })

  test('should not modify an already sorted array', () => {
    const ascendingSort = fn.sortWithNull(true)
    const inputArray = [1, 2, 3, null, null, 4]
    const sortedArray = inputArray.sort(ascendingSort)
    expect(sortedArray).toEqual([1, 2, 3, 4, null, null])
  })

  test('should sort an array with only null values', () => {
    const ascendingSort = fn.sortWithNull(true)
    const inputArray = [null, null, null]
    const sortedArray = inputArray.sort(ascendingSort)
    expect(sortedArray).toEqual([null, null, null])
  })

  test('should handle an empty array', () => {
    const ascendingSort = fn.sortWithNull(true)
    const inputArray: AnyObject[] = []
    const sortedArray = inputArray.sort(ascendingSort)
    expect(sortedArray).toEqual([])
  })
})

describe('Test suite - addedTo Function', () => {
  test('should return an empty array when any input is not an object', () => {
    const fresh: AnyObject = 'notAnObject'
    const stale: AnyObject = { name: 'John' }
    const keys: AnyObject = ['name']
    const result = fn.addedTo(fresh, stale, keys)
    expect(result).toEqual([])
  })

  test('should return an empty array when keys array is empty', () => {
    const fresh: AnyObject = { name: 'Alice' }
    const stale: AnyObject = { name: 'Bob' }
    const keys: string[] = []
    const result = fn.addedTo(fresh, stale, keys)
    expect(result).toEqual([])
  })

  test('should return added items in the fresh array', () => {
    const fresh = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Eve' },
    ]
    const stale = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ]
    const keys = ['id']
    const result = fn.addedTo(fresh, stale, keys)
    expect(result).toEqual([{ id: 3, name: 'Eve' }])
  })

  test('should handle keys that are not present in some items', () => {
    const fresh = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { name: 'Eve' },
    ]
    const stale = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ]
    const keys = ['id']
    const result = fn.addedTo(fresh, stale, keys)
    expect(result).toEqual([{ name: 'Eve' }])
  })

  test('should handle empty input arrays', () => {
    const fresh: AnyObject[] = []
    const stale: AnyObject[] = []
    const keys = ['id']
    const result = fn.addedTo(fresh, stale, keys)
    expect(result).toEqual([])
  })
})

describe('Test suite - removedFrom Function', () => {
  test('should return an empty array when any input is not an object', () => {
    const fresh: AnyObject = 'notAnObject'
    const stale: AnyObject = [{ name: 'John' }]
    const keys: AnyObject = ['name']
    const result = fn.removedFrom(fresh, stale, keys)
    expect(result).toEqual([])
  })

  test('should return an empty array when keys array is empty', () => {
    const fresh = [{ name: 'Alice' }]
    const stale = [{ name: 'Bob' }]
    const keys: string[] = []
    const result = fn.removedFrom(fresh, stale, keys)
    expect(result).toEqual([])
  })

  test('should return removed items in the stale array', () => {
    const fresh = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ]
    const stale = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Eve' },
    ]
    const keys = ['id']
    const result = fn.removedFrom(fresh, stale, keys)
    expect(result).toEqual([{ id: 3, name: 'Eve' }])
  })

  test('should handle keys that are not present in some items', () => {
    const fresh = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ]
    const stale = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { name: 'Eve' },
    ]
    const keys = ['id']
    const result = fn.removedFrom(fresh, stale, keys)
    expect(result).toEqual([{ name: 'Eve' }])
  })

  test('should handle empty input arrays', () => {
    const fresh: AnyObject[] = []
    const stale: AnyObject[] = []
    const keys = ['id']
    const result = fn.removedFrom(fresh, stale, keys)
    expect(result).toEqual([])
  })
})

describe('Test suite - matchedProperties Function', () => {
  test('should return an empty array when any input is not an object', () => {
    const objX: AnyObject = 'notAnObject'
    const objY: AnyObject = [{ name: 'John' }]
    const keys: string[] = ['name']
    const result = fn.matchedProperties(objX, objY, keys)
    expect(result).toEqual([])
  })

  test('should return an empty array when keys array is empty', () => {
    const objX: AnyObject = [{ name: 'Alice' }]
    const objY: AnyObject = [{ name: 'Bob' }]
    const keys: string[] = []
    const result = fn.matchedProperties(objX, objY, keys)
    expect(result).toEqual([])
  })

  test('should return matched properties from objY', () => {
    const objX = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ]
    const objY = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Eve' },
    ]
    const keys = ['id']
    const result = fn.matchedProperties(objX, objY, keys)
    expect(result).toEqual([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ])
  })

  test('should handle keys that are not present in some objects', () => {
    const objX = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ]
    const objY = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { name: 'Eve' },
    ]
    const keys = ['id']
    const result = fn.matchedProperties(objX, objY, keys)
    expect(result).toEqual([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ])
  })

  test('should handle empty input arrays', () => {
    const objX: AnyObject[] = []
    const objY: AnyObject[] = []
    const keys = ['id']
    const result = fn.matchedProperties(objX, objY, keys)
    expect(result).toEqual([])
  })
})

describe('Test suite - isValidHttpUrl Function', () => {
  test('should return true for a valid HTTP URL', () => {
    const url = 'http://www.example.com'
    const result = fn.isValidHttpUrl(url)
    expect(result).toBe(true)
  })

  test('should return true for a valid HTTPS URL', () => {
    const url = 'https://www.example.com'
    const result = fn.isValidHttpUrl(url)
    expect(result).toBe(true)
  })

  test('should return false for an invalid URL', () => {
    const url = 'invalid-url'
    const result = fn.isValidHttpUrl(url)
    expect(result).toBe(false)
  })

  test('should return false for a non-HTTP/HTTPS protocol', () => {
    const url = 'ftp://www.example.com'
    const result = fn.isValidHttpUrl(url)
    expect(result).toBe(false)
  })

  test('should return false for an empty string', () => {
    const url = ''
    const result = fn.isValidHttpUrl(url)
    expect(result).toBe(false)
  })

  test('should return false for a URL without a protocol', () => {
    const url = 'www.example.com'
    const result = fn.isValidHttpUrl(url)
    expect(result).toBe(false)
  })
})

describe('Test suite - makeCancelable Function', () => {
  test('should resolve with the expected value when not canceled', async () => {
    const expectedValue = { result: 'success' }
    const promise = new Promise((resolve) =>
      setTimeout(() => resolve(expectedValue), 100)
    )
    const cancelablePromise = fn.makeCancelable(promise)
    const result = await cancelablePromise.promise
    expect(result).toEqual(expectedValue)
  })

  test('should reject with an "Cancelled" error when canceled', async () => {
    const promise = new Promise<void>((resolve) =>
      setTimeout(() => resolve(), 100)
    )
    const cancelablePromise = fn.makeCancelable(promise)

    cancelablePromise.cancel()

    try {
      await cancelablePromise.promise
    } catch (error) {
      expect(error.message).toBe('Cancelled')
    }
  })
})

describe('Tests suite - ellipsisFn Function', () => {
  test('Should return an address with 4 digits and default ellipsis (start) ', () => {
    const result = fn.ellipsisFn(address, 4, 'start')
    expect(result).toBe('...ZmY7')
  })

  test("Should return an address with 4 digits and 'end' ellipsis", () => {
    const result = fn.ellipsisFn(address, 4, 'end')
    expect(result).toBe('234C...')
  })

  test("Should return an address with 4 digits and ellipsis 'center'", () => {
    const result = fn.ellipsisFn(address, 4)
    expect(result).toBe('234C...ZmY7')
  })

  test("Should return an address with 10 digits and ellipsis 'center'", () => {
    const result = fn.ellipsisFn(address, 10)
    expect(result).toBe('234CHvWmTu...oFaetEZmY7')
  })

  test("Should return an address with minimum default of 4 digits and ellipsis 'center' when the amount given is too small (2)", () => {
    const result = fn.ellipsisFn(address, 2)
    expect(result).toBe('234C...ZmY7')
  })

  test("Should return an address with minimum default of 4 digits and ellipsis 'center' when the amount given is too large (string.length / 2 - 3)", () => {
    const result = fn.ellipsisFn(address, 100)
    expect(result).toBe('234CHvWmTuaVtkJpLS9ox...amcEMrfFAPYoFaetEZmY7')
  })

  test('Should return a string with given amount of digits (here 8), starting with ellipsis when the amount is more than the default(4) and less than the length of the string', () => {
    const result = fn.ellipsisFn('Some random value', 8, 'start')
    expect(result).toBe('...dom value')
  })

  test('Should return a string with given amount of digits (here 8), starting with ellipsis when the amount is more than the default(4) and less than the length of the string', () => {
    const result = fn.ellipsisFn('Some random value', 8, 'end')
    expect(result).toBe('Some ran...')
  })
})

describe('maxBigInt', () => {
  test('returns the maximum value in a list of positive BigInts', () => {
    expect(fn.maxBigInt(10n, 50n, 30n, 100n, 20n)).toEqual(100n)
  })

  test('returns the maximum value in a list containing negative BigInts', () => {
    expect(fn.maxBigInt(-10n, -50n, -30n, -100n, -20n)).toEqual(-10n)
  })

  test('returns the correct maximum value when only one BigInt is provided', () => {
    expect(fn.maxBigInt(42n)).toEqual(42n)
  })

  test('returns the maximum value when BigInts of varying signs are provided', () => {
    expect(fn.maxBigInt(-1000n, 500n, -200n, 1000n)).toEqual(1000n)
  })

  test('throws a TypeError if no values are provided', () => {
    expect(() => fn.maxBigInt()).toThrow(TypeError)
  })
})

describe('minBigInt', () => {
  test('returns the minimum value in a list of positive BigInts', () => {
    expect(fn.minBigInt(10n, 50n, 30n, 100n, 20n)).toEqual(10n)
  })

  test('returns the minimum value in a list containing negative BigInts', () => {
    expect(fn.minBigInt(-10n, -50n, -30n, -100n, -20n)).toEqual(-100n)
  })

  test('returns the correct minimum value when only one BigInt is provided', () => {
    expect(fn.minBigInt(42n)).toEqual(42n)
  })

  test('returns the minimum value when BigInts of varying signs are provided', () => {
    expect(fn.minBigInt(-1000n, 500n, -200n, 1000n)).toEqual(-1000n)
  })

  test('throws a TypeError if no values are provided', () => {
    expect(() => fn.minBigInt()).toThrow(TypeError)
  })
})
