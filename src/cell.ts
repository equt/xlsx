import { CellAddress, CellObject, Range, utils, WorkSheet } from 'xlsx'

export type CellMeta = Readonly<{
  address: CellAddress
  type: 'DIRECT' | 'MERGED'
}>

export type Cell = Readonly<
  {
    meta: CellMeta
  } & (
    | {
        type: 'string'
        value: string
      }
    | {
        type: 'number'
        value: number
      }
    | {
        type: 'boolean'
        value: boolean
      }
    | {
        type: 'date'
        value: Date
      }
  )
>

const normalize = (
  raw: CellObject,
  address: CellAddress,
  type: CellMeta['type'],
): Nullable<Cell> => {
  // For my personal use case, I never parse the formula
  if (isNullable(raw.v) || raw.t === 'e' || raw.t === 'z') return undefined

  switch (raw.t) {
    case 's':
      return { type: 'string', value: raw.v as string, meta: { address, type } }
    case 'n':
      return { type: 'number', value: raw.v as number, meta: { address, type } }
    case 'b':
      return {
        type: 'boolean',
        value: raw.v as boolean,
        meta: { address, type },
      }
    case 'd':
      return {
        type: 'date',
        value: raw.v as Date,
        meta: { address, type },
      }
  }
}

export const contains = (address: CellAddress) => (scope: Range) =>
  address.r >= scope.s.r &&
  address.r <= scope.e.r &&
  address.c >= scope.s.c &&
  address.c <= scope.e.c

export const iterate = (scope: Range): Array<CellAddress> =>
  range(scope.s.r, scope.e.r + 1)
    .product(range(scope.s.c, scope.e.c + 1))
    .map(([r, c]) => ({ r, c }))

export const get = (
  worksheet: WorkSheet,
  address: CellAddress,
): Nullable<Cell> => {
  const go = (address: CellAddress, type: CellMeta['type']): Nullable<Cell> => {
    const raw: CellObject | undefined = worksheet[utils.encode_cell(address)]
    if (isNonNullable(raw)) return normalize(raw, address, type)
    if (type === 'MERGED') return // Not the hero of the merge

    const scope = (worksheet['!merges'] ?? []).find(contains(address))
    if (isNullable(scope)) return // Not in any merge

    const hero = iterate(scope)
      .map(address => go(address, 'MERGED'))
      .find(isNonNullable)
    if (isNullable(hero)) return // Umm, no hero in the merge?
    return { ...hero, meta: { type: 'MERGED', address } }
  }

  return go(address, 'DIRECT')
}
