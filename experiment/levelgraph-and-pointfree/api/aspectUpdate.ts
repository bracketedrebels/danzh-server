import { always } from "ramda"
import uniqueId from "uniqueid"
import get from "../db/get"
import put from "../db/put"
import v from "../db/v"

const projectId = uniqueId("aspect")

export default (db: any) => (parent: string) => ({
  predicate,
  type,
  description,
}: {
  predicate: string
  type: string
  description?: string
}) =>
  ((id) =>
    get(db)([[predicate, "hasAspect", v(db)("aspect")]])
      .then((v) => v.length)
      .then((position) =>
        put(db)([
          [predicate, "hasAspect", id],
          [id, "hasType", type],
          ...(description ? [[id, "describedAs", description] as const] : []),
          [id, "inPosition", position.toString()],
        ]).then(always(id))
      ))(projectId())
