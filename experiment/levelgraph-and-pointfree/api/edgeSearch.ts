import { DB } from "../db"
import { SearchAtom } from "./types"

export default (db: DB) => (parent: string) => (query?: SearchAtom[]) => {
  const q = normalize(db)
  return query === undefined
    ? db.get([
        [parent, "ownsEntity", db.v("subject")],
        [db.v("s"), db.v("p"), db.v("o")],
      ])
    : db.get(query.map(({ s, p, o }) => [q(s), q(p), q(o)]))
}

const normalize = (db: DB) => (v: string) => (v.startsWith("$") ? db.v(v.slice(1)) : v)
