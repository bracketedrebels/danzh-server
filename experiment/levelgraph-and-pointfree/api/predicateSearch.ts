import { map } from "ramda"
import { DB } from "../db"
import aspectSearch from "./aspectSearch"

export default (db: DB) => (parent?: string) => ({ id }: { id?: string }) => {
  const relatedAspects = aspectSearch(db)
  return id === undefined
    ? db
        .get([
          [parent, "ownsPredicate", db.v("id")],
          [db.v("id"), "hasName", db.v("name")],
          [db.v("id"), "describedAs", db.v("description")],
        ])
        .then(
          map((v) => ({
            ...v,
            aspects: relatedAspects(v.id),
          }))
        )
    : db
        .get([
          [id, "hasName", db.v("name")],
          [id, "describedAs", db.v("description")],
        ])
        .then(map((v) => ({ ...v, aspects: relatedAspects(id) })))
}
