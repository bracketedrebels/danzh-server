import { always, last } from "ramda"
import { O } from "ts-toolbelt"
import { DB } from "../db"
import { aspectId, has } from "./consts"
import { AspectTypeSet } from "./types"

export default (db: DB) => ({
  predicateId,
  init,
}: {
  predicateId: string
  init: O.Omit<AspectTypeSet, "id" | "position">
}) =>
  ((id) =>
    db.get([[predicateId, has.aspect, db.v("aspect")]]).then((list) => {
      const position = list.length
      const requiredAllowed = last(
        list.sort((a, b) => (a.position < b.position ? -1 : a.position > b.position ? 1 : 0))
      )?.["required"]
      return !requiredAllowed && init.required
        ? Promise.reject(406)
        : db
            .put([
              [
                predicateId,
                has.aspect,
                id,
                {
                  ...init,
                  position,
                },
              ],
            ])
            .then(
              always({
                id,
                position,
                ...init,
              })
            )
    }))(aspectId())
