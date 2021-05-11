import { F } from "ts-toolbelt"

export default (db: any) => (put: F.Parameters<typeof db["put"]>[0]) =>
  new Promise<void>((resolve, reject) =>
    db.put(put, (err: any) => (!err ? resolve() : reject(err)))
  )
