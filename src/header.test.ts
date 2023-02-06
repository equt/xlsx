import '@equt/prelude'
import { head } from './header'

describe('head', () => {
  it('is an one-line header', () => {
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
  })

  it('is a two-lines header', () => {
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

  it('is a three-lines header', () => {
    expect(
      head({
        A1: { t: 's', v: 'A1' },
        A2: { t: 's', v: 'A2' },
        C2: { t: 's', v: 'C2' },
        A3: { t: 's', v: 'A3' },
        B3: { t: 's', v: 'B3' },
        ['!ref']: 'A1:C3',
        ['!merges']: [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
          { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
          { s: { r: 1, c: 2 }, e: { r: 2, c: 2 } },
        ],
      }),
    ).toEqual([
      [
        {
          type: 'string',
          value: 'A1',
          meta: {
            address: { r: 0, c: 0 },
            type: 'HERO',
            range: { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
          },
        },
        {
          type: 'string',
          value: 'A2',
          meta: {
            address: { r: 1, c: 0 },
            type: 'HERO',
            range: { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
          },
        },
        {
          type: 'string',
          value: 'A3',
          meta: { address: { r: 2, c: 0 }, type: 'DIRECT' },
        },
      ],
      [
        {
          type: 'string',
          value: 'A1',
          meta: {
            address: { r: 0, c: 1 },
            type: 'MERGED',
            range: { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
          },
        },
        {
          type: 'string',
          value: 'A2',
          meta: {
            address: { r: 1, c: 1 },
            type: 'MERGED',
            range: { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
          },
        },
        {
          type: 'string',
          value: 'B3',
          meta: { address: { r: 2, c: 1 }, type: 'DIRECT' },
        },
      ],
      [
        {
          type: 'string',
          value: 'A1',
          meta: {
            address: { r: 0, c: 2 },
            type: 'MERGED',
            range: { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
          },
        },
        {
          type: 'string',
          value: 'C2',
          meta: {
            address: { r: 1, c: 2 },
            type: 'HERO',
            range: { s: { r: 1, c: 2 }, e: { r: 2, c: 2 } },
          },
        },
      ],
    ])
  })

  it('has empty cell below merged cells', () => {
    expect(
      head({
        A1: { t: 's', v: 'A1' },
        A2: { t: 's', v: 'A2' },
        C2: { t: 's', v: 'C2' },
        A3: { t: 's', v: 'A3' },
        ['!ref']: 'A1:C3',
        ['!merges']: [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
          { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
          { s: { r: 1, c: 2 }, e: { r: 2, c: 2 } },
        ],
      }),
    ).toEqual(undefined)
  })

  it('should respect restriction', () => {
    expect(
      head(
        {
          A1: { t: 's', v: 'A1' },
          B1: { t: 's', v: 'B1' },
          C1: { t: 's', v: 'C1' },
          ['!ref']: 'A1:B1',
        },
        { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
      ),
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
  })

  it('should skip lines containing empty cells', () => {
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
  })

  it('should fail if every line contains at least an empty cell', () => {
    expect(
      head({
        A1: { t: 's', v: 'A1' },
        ['!ref']: 'A1:C1',
      }),
    ).toEqual(undefined)
  })

  it('should fail if the worksheet is empty', () => {
    expect(head({})).toEqual(undefined)
    expect(head({ A1: { t: 's', v: 'A1' } })).toEqual(undefined)
  })
})
