import { map, when } from "ramda"
import { DB } from "../db"
import edgeSearch from "./edgeSearch"
import entitySearch from "./entitySearch"
import predicateSearch from "./predicateSearch"
import { QueryResolver } from "./types"

// export default ((db: DB) => when()) as QueryResolver
// console.log(navigator, context)
// return () => Promise.resolve([])
// const relatedPredicates = predicateSearch(db)
// const relatedEntities = entitySearch(db)
// const relatedEdges = edgeSearch(db)
// console.log(JSON.stringify(ctx, null, 2))
// return id === undefined
//   ? db
//       .get([
//         [parent, "ownsProject", db.v("id")],
//         [db.v("id"), "hasName", db.v("name")],
//         [db.v("id"), "describedAs", db.v("description")],
//       ])
//       .then(
//         map((v) => ({
//           ...v,
//           predicates: relatedPredicates(v.id),
//           entities: relatedEntities(v.id),
//           edges: relatedEdges(v.id),
//         }))
//       )
//   : db
//       .get([
//         [id, "hasName", db.v("name")],
//         [id, "describedAs", db.v("description")],
//       ])
//       .then(
//         map((v) => ({
//           ...v,
//           id,
//           predicates: relatedPredicates(id),
//           entities: relatedEntities(id),
//           edges: relatedEdges(id),
//         }))
//       )
