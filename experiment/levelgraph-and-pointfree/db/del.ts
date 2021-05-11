import { F } from "ts-toolbelt"

export default (db: any) => (del: F.Parameters<typeof db["del"]>[0]) =>
  new Promise<void>((resolve, reject) =>
    db.del(del, (err: any) => (!err ? resolve() : reject(err)))
  )
