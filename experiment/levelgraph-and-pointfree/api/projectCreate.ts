import { always } from "ramda"
import uniqueId from "uniqueid"

const projectId = uniqueId("project")

export default (db: any) => (parent: string) => ({
  name,
  description,
}: {
  name: string
  description?: string
}) =>
  ((id) =>
    db
      .put([
        [parent, "ownsProject", id],
        [id, "hasName", name],
        [id, "describedAs", description],
      ])
      .then(always(id)))(projectId())
