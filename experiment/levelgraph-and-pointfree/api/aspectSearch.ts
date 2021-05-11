import { assoc, map } from "ramda"
import { noop } from "ramda-adjunct"
import { DB } from "../db"
import { has } from "./consts"

export default (db: DB) => (parent?: string) => (v: { id?: string }, ...rest: any[]) => {
  console.log(...rest)
  // return {
  //   id: noop,
  //   position: noop,
  //   required: noop,
  //   type: noop,
  //   description: noop
  // };
  return v.id === undefined
    ? db.get([
        [parent, has.aspect, db.v("id")],
        [db.v("id"), has.name, db.v("name")],
        [db.v("id"), has.description, db.v("description")],
      ])
    : db
        .get([
          [v.id, has.name, db.v("name")],
          [v.id, has.description, db.v("description")],
        ])
        .then(map(assoc("id", v.id)))
}
