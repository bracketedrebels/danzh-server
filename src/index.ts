import express from "express"
import { buildSchema } from "graphql"
import { graphqlHTTP } from "express-graphql"
import { readFile } from "fs/promises"
import { resolve } from "path"
import { always, partialRight, toString } from "ramda"

readFile(resolve(__dirname, "schema.graphql"))
  .then(toString)
  .then(partialRight(buildSchema, [{}]))
  .then((schema) =>
    express().use(
      "/gql",
      graphqlHTTP({
        schema: schema,
        rootValue: {
          projects: always([]),
          entities: always([]),
          predicates: always([]),
          edges: always([]),
        },
        graphiql: true,
      })
    )
  )
  .then((app) => app.listen(4000))
  .then(() => console.log("Running a GraphQL API server at http://localhost:4000/gql"))
