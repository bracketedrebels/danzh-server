import { ApolloServer, gql } from "apollo-server-express"
import express from "express"
import { readFile } from "fs/promises"
import { createServer } from "http"
import morgan from "morgan"
import { Optional } from "Object/Optional"
import { Dictionary, keys, objOf, pickAll, pipe, reject, tap } from "ramda"
import { included, noop } from "ramda-adjunct"
import { connect, Connection, ConnectionOptions, db, dbCreate, table } from "rethinkdb"

function environmentValid(
  env: Optional<Dictionary<string>>
): env is {
  DB_HOST: string
  DB_PORT: string
  DB_USER: string
  DB_PASSWORD: string
  DB_NAME: string
  API_PORT: string
  GQL_SCHEMA_PATH: string
} {
  const requiredVars = [
    "DB_HOST",
    "DB_PORT",
    "DB_USER",
    "DB_PASSWORD",
    "DB_NAME",
    "API_PORT",
    "GQL_SCHEMA_PATH",
  ]
  const notDefinedVars = pipe(
    pickAll(requiredVars),
    keys,
    reject(included(requiredVars))
  )(env) as string[]
  if (notDefinedVars.length > 0) {
    console.error(`"${notDefinedVars.join(`", "`)}" environment variable are not set`)
    process.exit(1)
  }
  return true
}

if (environmentValid(process.env)) {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, API_PORT, GQL_SCHEMA_PATH, DB_NAME } = process.env

  const DB_CONNECTION_CONFIGURATION = {
    host: DB_HOST,
    port: Number.parseInt(DB_PORT, 10),
    user: DB_USER,
    password: DB_PASSWORD,
    db: DB_NAME,
  } as ConnectionOptions

  const onRDBConnectionClosed = (e: any) => console.log("RDB connection closed: ", e)
  const onRDBConnected = (conn: Connection) => {
    console.log("Connected to RethinkDB")
    conn.on("close", onRDBConnectionClosed)
    dbCreate(DB_NAME)
      .run(conn)
      .catch(noop)
      .then(() => db(DB_NAME).tableCreate("test").run(conn))
      .catch(noop)
      .then(() => table("test").insert({ hello: "world" }).run(conn))
  }

  Promise.all([
    readFile(GQL_SCHEMA_PATH),
    connect(DB_CONNECTION_CONFIGURATION).then(tap(onRDBConnected)).catch(tap(console.log)),
  ])
    .then(
      ([schemaContents, connection]) =>
        new ApolloServer({
          typeDefs: gql(schemaContents.toString()),
          // resolvers,
          context: objOf("conn")(connection),
          tracing: process.env.NODE_ENV !== "production",
        })
    )
    .then((apollo) =>
      apollo.installSubscriptionHandlers(
        createServer(
          express().use(morgan("combined")).use(express.static("dist")).use(apollo.getMiddleware())
        ).listen(API_PORT, () => console.log("listening on *:" + API_PORT))
      )
    )
}
