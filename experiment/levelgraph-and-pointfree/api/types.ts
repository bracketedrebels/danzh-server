import { DocumentNode, SelectionNode } from "graphql"
import { O } from "ts-toolbelt"
import { DB } from "../db"

export type RootResolver = (db: DB) => (ast: DocumentNode["definitions"][0]) => any
export type LevelgraphSearchVariable = any
export type ASTNode = O.Pick<SelectionNode, "name" | "selectionSet" | "directives" | "arguments">
export type QueryResolver = (db: DB) => (v: ReadonlyArray<ASTNode>) => LevelgraphSearchObject[]

export type AspectBase = {
  id: string
  name: string
  position: number
  required: boolean
  description?: string
}

export type AspectTypeNumeric = AspectBase & {
  min?: number
  max?: number
  step?: number
}

export type AspectTypeString = AspectBase & {
  regexp?: string
}

export type AspectTypeSet = AspectBase & {
  items?: string[]
}

export type AspectType = AspectTypeNumeric | AspectTypeSet | AspectTypeString

export type SearchAtom = {
  s: string
  p: string
  o: string
}

export type LevelgraphSearchObject = {
  subject?: string | LevelgraphSearchVariable
  predicate?: string | LevelgraphSearchVariable
  object?: string | LevelgraphSearchVariable
}
