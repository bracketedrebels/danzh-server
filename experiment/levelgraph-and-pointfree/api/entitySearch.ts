import { map } from "ramda"
import { DB } from "../db"

export default (db: DB) => (parent?: string) => ({ id }: { id?: string }) => {
  return id === undefined
    ? db.get([
        [parent, "declares", db.v("id")],
        [db.v("id"), "hasName", db.v("name")],
        [db.v("id"), "describedAs", db.v("description")],
      ])
    : db
        .get([
          [id, "hasName", db.v("name")],
          [id, "describedAs", db.v("description")],
        ])
        .then(map((v) => ({ ...v, id })))
}
