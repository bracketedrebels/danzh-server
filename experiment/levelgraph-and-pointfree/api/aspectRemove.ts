import { always } from "ramda"
import { DB } from "../db"
import { has } from "./consts"

export default (db: DB) => ({ id }: { id: string }) =>
  db.del([[db.v("predicate"), has.aspect, id]]).then(always(1))
