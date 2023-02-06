import '@equt/prelude'
import { collect, infer } from './body'
import { Header } from './header'

describe('infer', () => {
  it('should pass for one header', () => {
    const header = [
      {
        type: 'string',
        value: 'Foo',
        meta: { address: { r: 0, c: 0 }, type: 'DIRECT' },
      },
    ] as const

    expect(
      infer(
        [header],
        [
          new Map([
            [
              header,
              {
                type: 'string',
                value: 'Bar',
                meta: { address: { r: 1, c: 0 }, type: 'DIRECT' },
              },
            ],
          ]),
        ],
      ),
    ).toEqual(
      new Map([
        [
          [
            {
              type: 'string',
              value: 'Foo',
              meta: { address: { r: 0, c: 0 }, type: 'DIRECT' },
            },
          ] as const,
          new Set(['string']),
        ],
      ]),
    )
  })

  it('should infer `empty` for an empty cell', () => {
    const header = [
      {
        type: 'string',
        value: 'Foo',
        meta: { address: { r: 0, c: 0 }, type: 'DIRECT' },
      },
    ] as const

    expect(
      infer(
        [header],
        [
          new Map([
            [
              header,
              {
                type: 'string',
                value: 'Bar',
                meta: { address: { r: 1, c: 0 }, type: 'DIRECT' },
              },
            ],
          ]),
          new Map([[header, null]]),
        ],
      ),
    ).toEqual(
      new Map([
        [
          [
            {
              type: 'string',
              value: 'Foo',
              meta: { address: { r: 0, c: 0 }, type: 'DIRECT' },
            },
          ] as const,
          new Set(['string', 'empty']),
        ],
      ]),
    )
  })

  it('should pass for muliple headers', () => {
    const header1: Header = [
      {
        type: 'string',
        value: 'Foo',
        meta: { address: { r: 0, c: 0 }, type: 'DIRECT' },
      },
    ] as const

    const header2: Header = [
      {
        type: 'string',
        value: 'Bar',
        meta: { address: { r: 0, c: 1 }, type: 'DIRECT' },
      },
    ] as const

    expect(
      infer(
        [header1, header2],
        [
          new Map([
            [
              header1,
              {
                type: 'string',
                value: 'Bar',
                meta: { address: { r: 1, c: 0 }, type: 'DIRECT' },
              },
            ],
            [
              header2,
              {
                type: 'number',
                value: 42,
                meta: { address: { r: 1, c: 1 }, type: 'DIRECT' },
              },
            ],
          ]),
          new Map([
            [
              header1,
              {
                type: 'string',
                value: 'Bar',
                meta: { address: { r: 1, c: 0 }, type: 'DIRECT' },
              },
            ],
          ]),
        ],
      ),
    ).toEqual(
      new Map([
        [
          [
            {
              type: 'string',
              value: 'Foo',
              meta: { address: { r: 0, c: 0 }, type: 'DIRECT' },
            },
          ] as const,
          new Set(['string']),
        ],
        [
          [
            {
              type: 'string',
              value: 'Bar',
              meta: { address: { r: 0, c: 1 }, type: 'DIRECT' },
            },
          ],
          new Set(['number', 'empty']),
        ],
      ]),
    )
  })
})

describe('collect', () => {
  it('collects row by row', () => {
    expect(
      collect(
        {
          A1: { t: 's', v: 'A1' },
          A2: { t: 's', v: 'A2' },
          A3: { t: 's', v: 'A3' },
        },
        [
          [
            {
              type: 'string',
              value: 'A1',
              meta: { address: { r: 0, c: 0 }, type: 'DIRECT' },
            },
          ] as const,
        ],
        { s: { r: 1, c: 0 }, e: { r: 2, c: 0 } },
      ),
    ).toEqual([
      new Map([
        [
          [
            {
              type: 'string',
              value: 'A1',
              meta: { address: { r: 0, c: 0 }, type: 'DIRECT' },
            },
          ] as const,
          {
            type: 'string',
            value: 'A2',
            meta: { address: { r: 1, c: 0 }, type: 'DIRECT' },
          },
        ],
      ]),
      new Map([
        [
          [
            {
              type: 'string',
              value: 'A1',
              meta: { address: { r: 0, c: 0 }, type: 'DIRECT' },
            },
          ] as const,
          {
            type: 'string',
            value: 'A3',
            meta: { address: { r: 2, c: 0 }, type: 'DIRECT' },
          },
        ],
      ]),
    ])
  })

  it('ignore rows having more cells than headers', () => {
    expect(
      collect(
        {
          A1: { t: 's', v: 'A1' },
          A2: { t: 's', v: 'A2' },
        },
        [
          [
            {
              type: 'string',
              value: 'A1',
              meta: { address: { r: 0, c: 0 }, type: 'DIRECT' },
            },
          ] as const,
        ],
        { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
      ),
    ).toEqual([
      new Map([
        [
          [
            {
              type: 'string',
              value: 'A1',
              meta: { address: { r: 0, c: 0 }, type: 'DIRECT' },
            },
          ] as const,
          {
            type: 'string',
            value: 'A2',
            meta: { address: { r: 1, c: 0 }, type: 'DIRECT' },
          },
        ],
      ]),
    ])
  })
})
