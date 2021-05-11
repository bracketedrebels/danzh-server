import { F } from "ts-toolbelt"
import del from "./del"
import get from "./get"
import put from "./put"
import v from "./v"

const levelgraph = require("levelgraph")
const level = require("level")

const db = (name: string) =>
  ((db: any) => ({
    name,
    put: put(db),
    get: get(db),
    v: v(db),
    del: del(db),
  }))(levelgraph(level(name)))

export default db

export type DB = F.Return<typeof db>
