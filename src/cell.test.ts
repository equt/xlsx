import '@equt/prelude'
import { contains, get, iterate } from './cell'

it('contains', () => {
  expect(
    contains({ r: 0, c: 0 })({ s: { r: 0, c: 0 }, e: { r: 0, c: 0 } }),
  ).toBeTruthy()
  expect(
    contains({ r: 1, c: 1 })({ s: { r: 0, c: 0 }, e: { r: 2, c: 2 } }),
  ).toBeTruthy()
  expect(
    contains({ r: 1, c: 1 })({ s: { r: 0, c: 0 }, e: { r: 1, c: 2 } }),
  ).toBeTruthy()
  expect(
    contains({ r: 1, c: 1 })({ s: { r: 0, c: 0 }, e: { r: 2, c: 1 } }),
  ).toBeTruthy()

  expect(
    contains({ r: 2, c: 1 })({ s: { r: 0, c: 0 }, e: { r: 1, c: 1 } }),
  ).toBeFalsy()
  expect(
    contains({ r: 1, c: 2 })({ s: { r: 0, c: 0 }, e: { r: 1, c: 1 } }),
  ).toBeFalsy()
})

it('iterate', () => {
  expect(iterate({ s: { r: 0, c: 0 }, e: { r: 0, c: 0 } })).toEqual([
    { r: 0, c: 0 },
  ])
  expect(iterate({ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } })).toEqual([
    { r: 0, c: 0 },
    { r: 0, c: 1 },
  ])
  expect(iterate({ s: { r: 0, c: 0 }, e: { r: 1, c: 0 } })).toEqual([
    { r: 0, c: 0 },
    { r: 1, c: 0 },
  ])
  expect(iterate({ s: { r: 0, c: 0 }, e: { r: 1, c: 1 } })).toEqual([
    { r: 0, c: 0 },
    { r: 0, c: 1 },
    { r: 1, c: 0 },
    { r: 1, c: 1 },
  ])
})

it('get', () => {
  expect(get({}, { r: 0, c: 0 })).toEqual(undefined)
  expect(get({ A1: {} }, { r: 0, c: 0 })).toEqual(undefined)
  expect(get({ A1: { t: 'z' } }, { r: 0, c: 0 })).toEqual(undefined)
  expect(get({ A1: { t: 'e' } }, { r: 0, c: 0 })).toEqual(undefined)
  expect(get({ A1: { t: 's', v: '' } }, { r: 0, c: 0 })).toEqual({
    meta: { type: 'DIRECT', address: { r: 0, c: 0 } },
    type: 'string',
    value: '',
  })
  expect(get({ A1: { t: 'n', v: 0 } }, { r: 0, c: 0 })).toEqual({
    meta: { type: 'DIRECT', address: { r: 0, c: 0 } },
    type: 'number',
    value: 0,
  })
  expect(get({ A1: { t: 'b', v: true } }, { r: 0, c: 0 })).toEqual({
    meta: { type: 'DIRECT', address: { r: 0, c: 0 } },
    type: 'boolean',
    value: true,
  })
  expect(
    get(
      { A1: { t: 'd', v: Date.parse('01 Jan 1970 00:00:00 GMT') } },
      { r: 0, c: 0 },
    ),
  ).toEqual({
    meta: { type: 'DIRECT', address: { r: 0, c: 0 } },
    type: 'date',
    value: Date.parse('01 Jan 1970 00:00:00 GMT'),
  })
  expect(
    get(
      {
        A1: { t: 'n', v: 0 },
        '!merges': [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }],
      },
      { r: 0, c: 0 },
    ),
  ).toEqual({
    meta: { type: 'HERO', address: { r: 0, c: 0 } },
    type: 'number',
    value: 0,
  })
  expect(
    get(
      {
        B1: { t: 'n', v: 0 },
        '!merges': [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }],
      },
      { r: 0, c: 0 },
    ),
  ).toEqual({
    meta: { type: 'MERGED', address: { r: 0, c: 0 } },
    type: 'number',
    value: 0,
  })
  expect(
    get(
      {
        '!merges': [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }],
      },
      { r: 0, c: 0 },
    ),
  ).toEqual(undefined)
})
