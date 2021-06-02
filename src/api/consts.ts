import { head, pipe, prop } from "ramda"

export const withChanges = { returnChanges: true }
export const getNewValue = pipe(prop("changes") as any, head, prop("new_val") as any)
export const getOldValue = pipe(prop("changes") as any, head, prop("old_val") as any)
export const cursorDecode = (v: string) => JSON.parse(Buffer.from(v, "base64").toString("utf8"))
