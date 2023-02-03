import { Range, WorkSheet, utils } from 'xlsx'
import { Cell, get, iterate } from './cell'

/**
 * Headers represents a list of header from left to right.
 *
 * For more details, see the {@link head} function
 * */
export type Headers = ReadonlyArray<ReadonlyNonEmptyArray<Cell>>

/**
 * Detect a possible header within the `restriction`
 *
 * This function comes with a few assumptions to make the task a little bit easier.
 *
 * - Each row represent one record, and every column describes an aspect of it
 * - The header starts at the first non-empty row, with the merged cells taken into account
 * - The header ends when all cross-columns headers resolved into individual ones
 *
 * A cell not in any merged cells will resolve to itself, without any further detection.
 * A multi-rows cell will behave exactly the same as the standalone cell. Cross-columns
 * header is resolved by recursively looking below to see until there is a single,
 * non-empty cell, and the reslt header will be an array of cells instead one single cell.
 *
 * The function will immediately return nullable if
 *
 * - An empty cell is found when resolving the multi-rows header
 * - Neither `!ref` of the given worksheet is found, nor the `restriction` is given
 * */
export const head = (
  worksheet: WorkSheet,
  restriction?: Range,
): Nullable<Headers> => {
  const scope =
    restriction ??
    (() => {
      const ref = worksheet['!ref']
      return isNonNullable(ref) ? utils.decode_range(ref) : undefined
    })()
  if (isNullable(scope)) return

  const primitive = iterate(scope)
    .group((a, b) => a.r === b.r)
    .findMap(row => {
      const mapped = row.map(address => get(worksheet, address))
      return mapped.every(isNonNullable) ? mapped : undefined
    })
  if (isNullable(primitive)) return

  const spread = (header: Array<Cell>, cell: Cell): Nullable<Array<Cell>> => {
    header.push(cell)
    if (
      cell.meta.type === 'DIRECT' ||
      (cell.meta.type === 'HERO' && cell.meta.range.s.c === cell.meta.range.e.c)
    )
      return header

    const next = get(worksheet, {
      r: cell.meta.address.r + 1,
      c: cell.meta.address.c,
    })
    if (isNullable(next)) return

    const spreaded = spread(header, next)
    if (isNullable(spreaded)) return
    return header
  }

  const compound = primitive.map(
    cell => spread([], cell) as Nullable<NonEmptyArray<Cell>>,
  )
  if (compound.every(isNonNullable)) return compound

  return
}
