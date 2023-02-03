import { CellAddress, CellObject, Range, utils, WorkSheet } from 'xlsx'

/**
 * Cell metadata, including the address and the type
 *
 * - `address` will always be the real {@link CellAddress}, even for a merged cell
 *   - `type` indicates if the cell value is retrieved from the the hero of the merged cells
 * */
export type CellMeta = Readonly<
  {
    address: CellAddress
  } & (
    | {
        type: 'DIRECT'
      }
    | { type: 'HERO' | 'MERGED'; range: Range }
  )
>

/**
 * Intermediate cell type
 * */
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

const normalize = (raw: CellObject, meta: CellMeta): Nullable<Cell> => {
  // For my personal use case, I never parse the formula
  if (isNullable(raw.v) || raw.t === 'e' || raw.t === 'z') return undefined

  switch (raw.t) {
    case 's':
      return { type: 'string', value: raw.v as string, meta }
    case 'n':
      return { type: 'number', value: raw.v as number, meta }
    case 'b':
      return {
        type: 'boolean',
        value: raw.v as boolean,
        meta,
      }
    case 'd':
      return {
        type: 'date',
        value: raw.v as Date,
        meta,
      }
  }
}

/**
 * Whether an address is within a {@link Range}
 * */
export const contains = (address: CellAddress) => (scope: Range) =>
  address.r >= scope.s.r &&
  address.r <= scope.e.r &&
  address.c >= scope.s.c &&
  address.c <= scope.e.c

/**
 * Create an array iterating over the {@link Range}, row by row, column by column
 * */
export const iterate = (scope: Range): Array<CellAddress> =>
  range(scope.s.r, scope.e.r + 1)
    .product(range(scope.s.c, scope.e.c + 1))
    .map(([r, c]) => ({ r, c }))

/**
 * Retrieve the {@link Cell} from the {@link WorkSheet}
 *
 * Different from the directly indexing, this function will take the `!merges` in the {@link WorkSheet} into account.
 * If the cell address is not found while within a merged range, the first (and hopefully the only) cell with value will be popped up instead.
 * Whether it's a direct read or a recursive search could be telled by looking at the `type` in {@link CellMeta}.
 *
 * This function will also treat the original `e` and `z`, a.k.a., the error and the empty cell as `undefined`.
 *
 * The complexity of this function is O(mn) where m is the size of `!merges`, and n is the size of the largest merged cells group.
 * */
export const get = (
  worksheet: WorkSheet,
  address: CellAddress,
): Nullable<Cell> => {
  const go = (address: CellAddress, type: CellMeta['type']): Nullable<Cell> => {
    const scope = (worksheet['!merges'] ?? []).find(contains(address))

    const raw: CellObject | undefined = worksheet[utils.encode_cell(address)]
    if (isNonNullable(raw))
      return normalize(
        raw,
        isNonNullable(scope)
          ? { type: 'HERO', address, range: scope }
          : { type: 'DIRECT', address },
      )
    if (type === 'MERGED') return // Not the hero of the merge
    if (isNullable(scope)) return // Not in any merge

    const hero = iterate(scope).findMap(address => go(address, 'MERGED'))
    if (isNullable(hero)) return // Umm, no hero in the merge?
    return { ...hero, meta: { type: 'MERGED', address, range: scope } }
  }

  return go(address, 'DIRECT')
}
