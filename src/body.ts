import { Range, WorkSheet } from 'xlsx'
import { Cell, get, iterate } from './cell'
import { Header, Headers } from './header'

export type Row = ReadonlyMap<Header, Nullable<Cell>>

export type Body = ReadonlyArray<Row>

export type ColumnType = Set<Cell['type'] | 'empty'>

export type RowType = Map<Header, ColumnType>

export const infer = (headers: Headers, body: Body): RowType =>
  body.reduce((accumulator, row) => {
    Array.from(accumulator.entries()).forEach(([header, type]) => {
      const t = row.get(header)?.type
      type.add(isNullable(t) ? 'empty' : t)
    })
    return accumulator
  }, new Map<Header, ColumnType>(headers.map(header => [header, new Set()])))

export const collect = (
  worksheet: WorkSheet,
  headers: Headers,
  restriction: Range,
): Body =>
  iterate(restriction)
    .group((a, b) => a.r === b.r)
    .filterMap(row =>
      row.length === headers.length
        ? new Map(headers.zip(row.map(address => get(worksheet, address))))
        : undefined,
    )
