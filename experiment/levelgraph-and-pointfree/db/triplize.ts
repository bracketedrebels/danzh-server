import {
  addIndex,
  adjust,
  always,
  aperture,
  flip,
  map,
  mergeRight,
  modulo,
  nthArg,
  objOf,
  pipe,
  reduce,
  reject,
} from "ramda"
import { isTruthy } from "ramda-adjunct"

export default pipe(
  aperture(3),
  addIndex(reject)(pipe(nthArg(1), flip(modulo)(2), isTruthy)),
  map(
    pipe(
      adjust(0, objOf("subject") as any),
      adjust(1, objOf("predicate") as any),
      adjust(2, objOf("object") as any),
      reduce(mergeRight, always({}) as any)
    )
  )
)
