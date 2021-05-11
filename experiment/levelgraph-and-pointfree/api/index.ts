// @ts-nocheck

import {
  adjust,
  always,
  ap,
  append,
  apply,
  ascend,
  assoc,
  assocPath,
  call,
  concat,
  cond,
  dropRepeatsWith,
  equals,
  evolve,
  flip,
  hasPath,
  head,
  ifElse,
  indexOf,
  last,
  map,
  mergeWith,
  nth,
  nthArg,
  objOf,
  of,
  path,
  pathEq,
  pathOr,
  pick,
  pipe,
  prepend,
  prop,
  reduce,
  repeat,
  reverse,
  sort,
  sortWith,
  split,
  T,
  tail,
  tap,
  thunkify,
  toPairs,
  transduce,
  unapply,
  when,
  whereEq,
} from "ramda"
import { flattenDepth, mergeRight, resolveP, thenP } from "ramda-adjunct"
import normalize from "../db/normalize"
import triplize from "../db/triplize"
import { DB } from "./../db/index"
import { declare, has, projectUID } from "./consts"

const nameIs = pathEq(["name", "value"])
const selections = pathOr([], ["selectionSet", "selections"])
const args = pathOr([], ["arguments"])

const projectId = when(nameIs("id"), always(triplize(["@", has.project, "?project.id"])))
const projectName = when(
  nameIs("name"),
  always(triplize(["@", has.project, "?project.id", has.name, "?project.name"]))
)
const projectDescription = when(
  nameIs("description"),
  always(triplize(["@", has.project, "?project.id", has.description, "?project.description"]))
)
const predicateId = when(
  nameIs("id"),
  always(triplize(["@", has.project, "?project.id", declare.predicate, "?project.predicate.id"]))
)
const predicateName = when(
  nameIs("name"),
  always(
    triplize([
      "@",
      has.project,
      "?project.id",
      declare.predicate,
      "?project.predicate.id",
      has.name,
      "?project.predicate.name",
    ])
  )
)
const predicateAspects = when(
  nameIs("aspect"),
  always(
    triplize([
      "@",
      has.project,
      "?project.id",
      declare.predicate,
      "?project.predicate.id",
      has.aspect,
      "?project.predicate.aspect.id",
    ])
  )
)

const projectPredicates = when(
  nameIs("predicate"),
  pipe(selections, transduce(map(pipe(predicateId, predicateName, predicateAspects)), concat, []))
)

const project = when(
  nameIs("project"),
  pipe(
    selections,
    transduce(map(pipe(projectId, projectName, projectDescription, projectPredicates)), concat, [])
  )
)

const AST2Query = transduce(map(project), concat, [])

const name2PutQuery = when(
  nameIs("name"),
  pipe(
    path(["value", "value"]),
    objOf("object"),
    assoc("predicate", has.name),
    flip(assoc("subject"))
  )
)

const description2PutQuery = when(
  nameIs("description"),
  pipe(
    path(["value", "value"]),
    objOf("object"),
    assoc("predicate", has.description),
    flip(assoc("subject"))
  )
)

const createProjectPutQueryBuilder = pipe(
  adjust(
    0,
    pipe(
      prop("arguments"),
      map(
        when(
          nameIs("init"),
          pipe(path(["value", "fields"]), map(pipe(name2PutQuery, description2PutQuery)))
        )
      ),
      flattenDepth(1),
      prepend(flip(assoc("object"))({ subject: "@", predicate: has.project }))
    )
  ),
  adjust(1, of),
  apply(ap)
)

export default (db: DB) =>
  pipe(
    when(
      whereEq({
        kind: "OperationDefinition" as const,
        operation: "query" as const,
      }),
      pipe(
        selections,
        AST2Query,
        sortWith([ascend(prop("subject")), ascend(prop("predicate")), ascend(prop("object"))]),
        dropRepeatsWith(whereEq),
        map(map(normalize(db))),
        objOf("get")
      )
    ),
    when(
      whereEq({
        kind: "OperationDefinition" as const,
        operation: "mutation" as const,
      }),
      pipe(
        selections,
        map(
          when(
            nameIs("projectCreate"),
            pipe(
              of,
              append(projectUID),
              adjust(1, call),
              flip(repeat)(2),
              adjust(0, pipe(createProjectPutQueryBuilder, map(map(normalize(db))), objOf("put"))),
              adjust(
                1,
                pipe(
                  adjust(
                    0,
                    pipe(
                      of,
                      ap([
                        pipe(selections, map(path(["name", "value"]))),
                        pipe(
                          args,
                          map(
                            when(
                              nameIs("init"),
                              pipe(
                                path(["value", "fields"]),
                                map(
                                  pipe(
                                    when(
                                      nameIs("name"),
                                      pipe(pathOr("", ["value", "value"]), objOf("name"))
                                    ),
                                    when(
                                      nameIs("description"),
                                      pipe(pathOr("", ["value", "value"]), objOf("description"))
                                    )
                                  )
                                ),
                                reduce(mergeRight, {
                                  predicate: [],
                                  entity: [],
                                  edge: [],
                                  id: "",
                                })
                              )
                            )
                          ),
                          nth(0)
                        ),
                      ]),
                      apply(pick)
                    )
                  ),
                  ifElse(pipe(head, hasPath(["id"])), pipe(reverse, apply(assoc("id"))), head),
                  objOf("just")
                )
              ),
              reduce(mergeRight, {}),
              evolve({
                just: objOf("projectCreate"),
              })
            )
          )
        ),
        reduce(
          mergeWith(
            cond([
              [pipe(nthArg(0), equals("just")), pipe(unapply(tail), apply(mergeRight))],
              [T, pipe(unapply(tail), apply(concat))],
            ])
          ),
          {}
        )
      )
    ),
    evolve({
      del: thunkify(db.del),
      put: thunkify(db.put),
      get: thunkify(
        pipe(
          db.get,
          thenP(tap(pipe(JSON.stringify, console.log))),
          thenP(
            map(
              pipe(
                toPairs,
                map(pipe(adjust(0, split(".")), apply(assocPath))),
                reduce(flip(call), {})
              )
            )
          )
        )
      ),
      just: thunkify(resolveP),
    }),
    toPairs,
    pipe(
      sort(ascend(pipe(head, flip(indexOf)(["del", "put", "get", "just"])))),
      map(last),
      reduce(flip(thenP), resolveP())
    )
  )
