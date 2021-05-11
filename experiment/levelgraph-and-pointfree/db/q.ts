import {
  addIndex,
  adjust,
  always,
  aperture,
  equals,
  flip,
  map,
  modulo,
  nthArg,
  objOf,
  pipe,
  reduce,
  reject,
  startsWith,
  tail,
  when,
} from "ramda"
import { isTruthy, mergeRight } from "ramda-adjunct"
import { DB } from "."

const defaultNormalizer = (db: DB) =>
  pipe(when(equals("@"), always(`@${db.name}`)), when(startsWith("?"), pipe(tail as any, db.v)))

export default ({
  db,
  normalizer = defaultNormalizer(db),
}: {
  db: DB
  normalizer?: (v: string) => any
}) =>
  pipe(
    map(normalizer),
    aperture(3),
    addIndex(reject)(pipe(nthArg(1), flip(modulo)(2), isTruthy)),
    map(
      pipe(
        adjust(0, objOf("subject") as any),
        adjust(1, objOf("predicate") as any),
        adjust(2, objOf("object") as any),
        reduce(mergeRight, always({}))
      )
    )
  )
