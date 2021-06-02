// @ts-nocheck

import { always } from "ramda"
import { r } from "rethinkdb-ts"
import { cursorDecode, getNewValue, getOldValue, withChanges } from "./consts"

export default {
  Mutation: {
    campaignCreate: (_, { init }, { databaseConnection }) =>
      r.table("campaign").insert(init, withChanges).run(databaseConnection).then(getNewValue),

    campaignUpdate: (_, { id, patch }, { databaseConnection }) =>
      r
        .table("campaign")
        .update({ id, ...patch }, withChanges)
        .run(databaseConnection)
        .then(getNewValue),

    campaignRemove: (_, { id }, { databaseConnection }) =>
      r.table("campaign").get(id).delete(withChanges).run(databaseConnection).then(getOldValue),

    entityCreate: (_, { id, init }, { databaseConnection }) =>
      r
        .table("entity")
        .insert(init, withChanges)
        .run(databaseConnection)
        .then(getNewValue)
        .then((ent) =>
          r
            .table("relation")
            .insert({
              sourceT: "campaign",
              targetT: "entity",
              source: id,
              target: ent.id,
            })
            .run(databaseConnection)
            .then(always(ent))
        ),

    entityUpdate: (_, { id, patch }, { databaseConnection }) =>
      r
        .table("entity")
        .update({ id, ...patch }, withChanges)
        .run(databaseConnection)
        .then(getNewValue),

    entityRemove: (_, { id }, { databaseConnection }) =>
      r.table("entity").get(id).delete(withChanges).run(databaseConnection).then(getOldValue),

    predicateCreate: (_, { id, init }, { databaseConnection }) =>
      r
        .table("predicate")
        .insert(init, withChanges)
        .run(databaseConnection)
        .then(getNewValue)
        .then((ent) =>
          r
            .table("relation")
            .insert({
              sourceT: "campaign",
              targetT: "predicate",
              source: id,
              target: ent.id,
            })
            .run(databaseConnection)
            .then(always(ent))
        ),

    predicateUpdate: (_, { id, patch }, { databaseConnection }) =>
      r
        .table("predicate")
        .update({ id, ...patch }, withChanges)
        .run(databaseConnection)
        .then(getNewValue),

    predicateRemove: (_, { id }, { databaseConnection }) =>
      r.table("predicate").get(id).delete(withChanges).run(databaseConnection).then(getOldValue),

    aspectCreateNumeric: (_, { init }, { databaseConnection }) =>
      r.table("aspect").insert(init, withChanges).run(databaseConnection).then(getNewValue),

    aspectCreateString: (_, { init }, { databaseConnection }) =>
      r.table("aspect").insert(init, withChanges).run(databaseConnection).then(getNewValue),

    aspectCreateSet: (_, { init }, { databaseConnection }) =>
      r.table("aspect").insert(init, withChanges).run(databaseConnection).then(getNewValue),

    aspectUpdate: (_, { id, patch }, { databaseConnection }) =>
      r
        .table("aspect")
        .update({ id, ...patch }, withChanges)
        .run(databaseConnection)
        .then(getNewValue),

    aspectRemove: (_, { id }, { databaseConnection }) =>
      r.table("aspect").get(id).delete(withChanges).run(databaseConnection).then(getOldValue),
  },

  Query: {
    campaign: (_, { id }, { databaseConnection }) =>
      r.table("campaign").get(id).run(databaseConnection),

    campaigns: (
      _,
      { size = 50, cursor, orderBy },
      { databaseConnection, q = r.table("campaign") }
    ) => {
      const [anchor, direction] = cursorDecode(cursor)
      const { field = "createDate", order = "desc" } = orderBy
      const ordered = q.orderBy({ index: order === "desc" ? r.desc(field) : r.asc(field) })
      const entity = r.row("id").eq(anchor)
      const forward = (offset) => ordered.skip(offset).limit(size)
      const backward = (offset) => ordered.skip(offset - size).limit(size)
      const mapper = r.branch(r.expr(direction).gt(0), forward, backward)
      return ordered.offsetsOf(entity).map(mapper).run(databaseConnection)
    },
  },
}
