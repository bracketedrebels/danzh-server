import { Dictionary } from "ramda"
import { F } from "ts-toolbelt"

export default (db: any) => (search: F.Parameters<typeof db["get"]>[0]) =>
  new Promise<Dictionary<string>[]>((resolve, reject) =>
    db.search(search, (err: any, results: Dictionary<string>[]) =>
      !err ? resolve(results) : reject(err)
    )
  )
