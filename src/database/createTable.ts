import { group, groupEnd, log } from "node:console"
import { always, thunkify } from "ramda"
import { noop } from "ramda-adjunct"
import { Connection, r } from "rethinkdb-ts"
import { F } from "ts-toolbelt"

export default (db: string) =>
  (...[name]: F.Parameters<typeof r["tableCreate"]>) =>
  (indicies: F.Parameters<F.Return<typeof r["table"]>["indexCreate"]>[]) =>
  (conn: Connection) => {
    return r
      .dbCreate(db)
      .run(conn)
      .then(thunkify(log)(`Created databse: ${db}`))
      .catch(noop)
      .then(thunkify(group)(`Creating "${name}" table on "${db}" database:`))
      .then(() => r.db(db).tableCreate(name).run(conn))
      .catch(thunkify(log)(`Table already exists. Continuing.`))
      .then(() =>
        Promise.all(
          indicies.map((v) =>
            r
              .db(db)
              .table(name)
              .indexCreate(...v)
              .run(conn)
              .then(thunkify(log)(`Index "${v}" created.`))
              .catch(thunkify(log)(`Index "${v}" already exists. Continuing.`))
          )
        )
      )
      .then(groupEnd)
      .then(always(conn))
  }
