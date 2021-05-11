import { thunkify } from "ramda"
import uniqueId from "uniqid"

export namespace declare {
  export const predicate = "declarePredicate"
  export const entity = "declareEntity"
}
export namespace has {
  export const aspect = "hasAspect"
  export const name = "hasName"
  export const description = "hasDescription"
  export const project = "hasProject"
}

export const aspectUID = thunkify(uniqueId)("aspect-")("")
export const entityUID = thunkify(uniqueId)("entity-")("")
export const predicateUID = thunkify(uniqueId)("predicate-")("")
export const projectUID = thunkify(uniqueId)("project-")("")
