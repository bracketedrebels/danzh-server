import { always, equals, pipe, startsWith, tail, when } from "ramda"
import { DB } from "."

export default (db: DB) =>
  pipe(when(equals("@"), always(`@${db.name}`)), when(startsWith("?"), pipe(tail as any, db.v)))
