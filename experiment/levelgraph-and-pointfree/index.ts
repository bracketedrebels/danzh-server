import express from "express"
import { graphqlHTTP } from "express-graphql"
import { readFile } from "fs/promises"
import { buildSchema } from "graphql"
import { resolve } from "path"
import { objOf, partialRight, toString } from "ramda"
import api from "./api"
import db from "./db"

const serviceDB = db("serviceDB")

readFile(resolve(__dirname, "schema.graphql"))
  .then(toString)
  .then(partialRight(buildSchema, [{}]))
  .then((schema) =>
    express().use(
      "/gql",
      graphqlHTTP({
        schema: schema,
        rootValue: api(serviceDB),
        graphiql: true,
        customExecuteFn: (ctx) => {
          const appropriateAST = ctx.document.definitions.find(
            (v, i) =>
              (v.kind === "OperationDefinition" &&
                v.name !== undefined &&
                v.name.value === ctx.operationName) ||
              i === 0
          )
          return ctx.rootValue?.(appropriateAST).then(objOf("data")).catch(objOf("error"))
        },
      })
    )
  )
  .then((app) => app.listen(4000))
  .then(() => console.log("Running a GraphQL API server at http://localhost:4000/gql"))
