import { always } from "ramda"
import uniqueId from "uniqueid"

const predicateId = uniqueId("predicate")

export default (db: any) => ({
  project,
  name,
  description,
}: {
  project: string
  name: string
  description?: string
}) =>
  ((id) =>
    db
      .put([
        [project, "ownsPredicate", id],
        [id, "hasName", name],
        ...(description ? [[id, "describedAs", description]] : []),
      ])
      .then(always(id)))(predicateId())
