import { Application, Router, RouterContext } from "https://deno.land/x/oak@v6.2.0/mod.ts"
import { applyGraphQL, gql } from "https://deno.land/x/oak_graphql/mod.ts"
import { always } from "https://deno.land/x/ramda@v0.27.2/mod.ts"
import {} from "https://deno.land/std@0.90.0/fs/mod.ts"

const app = new Application()
const resolvers = {
  Query: {
    entities: always([]),
  },
}

Deno.readTextFile("src/schema.graphql")
  .then(
    (v) =>
      gql`
        ${v}
      `
  )
  .then((typeDefs) =>
    applyGraphQL<Router>({
      Router,
      typeDefs,
      resolvers,
      context: (ctx: RouterContext) => {
        console.log(ctx)
        return { user: "Praveen" }
      },
    })
  )
  .then((service) => app.use(service.routes(), service.allowedMethods()))
  .then((app) => {
    console.log("Server start at http://localhost:8090")
    app.listen({ port: 8090 })
  })
