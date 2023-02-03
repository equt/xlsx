import '@equt/prelude'
import { head } from './header'

it('head', () => {
  expect(
    head({
      A1: { t: 's', v: 'A1' },
      B1: { t: 's', v: 'B1' },
      ['!ref']: 'A1:B1',
    }),
  ).toEqual([
    [
      {
        type: 'string',
        value: 'A1',
        meta: { type: 'DIRECT', address: { r: 0, c: 0 } },
      },
    ],
    [
      {
        type: 'string',
        value: 'B1',
        meta: { type: 'DIRECT', address: { r: 0, c: 1 } },
      },
    ],
  ])

  expect(
    head({
      A1: { t: 's', v: 'A1' },
      A2: { t: 's', v: 'A2' },
      B2: { t: 's', v: 'B2' },
      ['!ref']: 'A1:B2',
    }),
  ).toEqual([
    [
      {
        type: 'string',
        value: 'A2',
        meta: { type: 'DIRECT', address: { r: 1, c: 0 } },
      },
    ],
    [
      {
        type: 'string',
        value: 'B2',
        meta: { type: 'DIRECT', address: { r: 1, c: 1 } },
      },
    ],
  ])

  expect(
    head({
      A1: { t: 's', v: 'A1' },
      A2: { t: 's', v: 'A2' },
      B2: { t: 's', v: 'B2' },
      C1: { t: 's', v: 'C1' },
      ['!ref']: 'A1:C2',
      ['!merges']: [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
        { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } },
      ],
    }),
  ).toEqual([
    [
      {
        type: 'string',
        value: 'A1',
        meta: {
          type: 'HERO',
          address: { r: 0, c: 0 },
          range: { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
        },
      },
      {
        type: 'string',
        value: 'A2',
        meta: { type: 'DIRECT', address: { r: 1, c: 0 } },
      },
    ],
    [
      {
        type: 'string',
        value: 'A1',
        meta: {
          type: 'MERGED',
          address: { r: 0, c: 1 },
          range: { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
        },
      },
      {
        type: 'string',
        value: 'B2',
        meta: { type: 'DIRECT', address: { r: 1, c: 1 } },
      },
    ],
    [
      {
        type: 'string',
        value: 'C1',
        meta: {
          type: 'HERO',
          address: { r: 0, c: 2 },
          range: { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } },
        },
      },
    ],
  ])
})
