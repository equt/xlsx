import { Range, WorkSheet, utils } from 'xlsx'
import { Cell, get, iterate } from './cell'

export type Headers = ReadonlyArray<ReadonlyNonEmptyArray<Cell>>

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
