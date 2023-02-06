import { Range, WorkSheet, utils } from 'xlsx'
import { Cell, get, iterate } from './cell'

/**
 * Headers represents a list of header from left to right.
 *
 * For more details, see the {@link head} function
 * */
export type Headers = ReadonlyArray<Header>

/*
 * Header represents a primitive or compound table header
 *
 * For more details, see the {@link head} function
 */
export type Header = ReadonlyNonEmptyArray<Cell>

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
  // Use the user specified restriction, or the !ref if not found.
  // If neither was found, return early.
  const scope =
    restriction ??
    (() => {
      const ref = worksheet['!ref']
      return isNonNullable(ref) ? utils.decode_range(ref) : undefined
    })()
  if (isNullable(scope)) return

  // Found the first row representing the headers.
  // Early return if not found.
  const primitive = iterate(scope)
    .group((a, b) => a.r === b.r)
    .findMap(row => {
      const mapped = row.map(address => get(worksheet, address))
      return mapped.every(isNonNullable) ? mapped : undefined
    })
  if (isNullable(primitive)) return

  // Search for possible children for one single header cell.
  // If any process within this function failed, it failed at all.
  const spread = (header: Array<Cell>, cell: Cell): Nullable<Array<Cell>> => {
    header.push(cell)
    if (
      cell.meta.type === 'DIRECT' ||
      // Specially, if a multi-cells header is merged in vertical, treat it as a DIRECT cell
      (cell.meta.type === 'HERO' && cell.meta.range.s.c === cell.meta.range.e.c)
    )
      return header

    // The current cell is within a mult-columns range, children are required.

    // Move the cursor one row down.
    const next = get(worksheet, {
      r: cell.meta.address.r + 1,
      c: cell.meta.address.c,
    })
    if (isNullable(next)) return

    // Handle all children.
    const spreaded = spread(header, next)
    if (isNullable(spreaded)) return

    return header
  }

  // Start from the first row, and succeed only all requirements are satisfied.
  const compound = primitive.map(
    cell => spread([], cell) as Nullable<NonEmptyArray<Cell>>,
  )
  if (compound.every(isNonNullable)) return compound

  return
}
