import { ApolloServer, gql } from "apollo-server-express"
import express from "express"
import { readFile } from "fs/promises"
import { createServer } from "http"
import morgan from "morgan"
import { error, log } from "node:console"
import { Optional } from "Object/Optional"
import { always, Dictionary, keys, objOf, pickAll, pipe, reject, tap, thunkify } from "ramda"
import { included, resolveP } from "ramda-adjunct"
import { Connection, r } from "rethinkdb-ts"
import resolvers from "./api/resolvers"
import createTable from "./database/createTable"

function environmentValid(env: Optional<Dictionary<string>>): env is {
  DB_HOST: string
  DB_PORT: string
  DB_USER: string
  DB_PASSWORD: string
  DB_NAME_MAIN: string
  DB_NAME_AUTH: string
  API_PORT: string
  GQL_SCHEMA_PATH: string
  NODE_ENV: string
} {
  const requiredVars = [
    "DB_HOST",
    "DB_PORT",
    "DB_USER",
    "DB_PASSWORD",
    "DB_NAME_MAIN",
    "DB_NAME_AUTH",
    "API_PORT",
    "GQL_SCHEMA_PATH",
    "NODE_ENV",
  ]
  const notDefinedVars = pipe(
    pickAll(requiredVars),
    keys,
    reject(included(requiredVars))
  )(env) as string[]
  if (notDefinedVars.length > 0) {
    log(`"${notDefinedVars.join(`", "`)}" environment variables are not set`)
    process.exit(1)
  }
  return true
}

if (environmentValid(process.env)) {
  const {
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    API_PORT,
    GQL_SCHEMA_PATH,
    DB_NAME_AUTH,
    DB_NAME_MAIN,
    NODE_ENV,
  } = process.env

  const DB_CONNECTION_CONFIGURATION = {
    host: DB_HOST,
    port: Number.parseInt(DB_PORT, 10),
    user: DB_USER,
    password: DB_PASSWORD,
  }

  const onRDBConnectionClosed = (e: any) => log("RDB connection closed: ", e)
  const onRDBConnected = (conn: Connection) => {
    conn.on("close", onRDBConnectionClosed)
    log("Connected to RethinkDB")
    resolveP(conn)
      .then(createTable(DB_NAME_AUTH)("blacklist")([["token"]]))
      .then(createTable(DB_NAME_MAIN)("users")([]))
      .then(createTable(DB_NAME_MAIN)("campaign")([["name"], ["createDate"]]))
      .then(createTable(DB_NAME_MAIN)("entity")([["name"]]))
      .then(createTable(DB_NAME_MAIN)("relation")([["source"], ["target"]]))
      .then(createTable(DB_NAME_MAIN)("aspect")([["name"]]))
      .then(createTable(DB_NAME_MAIN)("predicate")([["name"]]))
      .then(createTable(DB_NAME_MAIN)("graph")([["subject"], ["predicate"], ["object"]]))
      .then(thunkify(log)("Database ready"))
      .then(always(conn))
  }

  Promise.all([
    readFile(GQL_SCHEMA_PATH),
    r.connect(DB_CONNECTION_CONFIGURATION).then(tap(onRDBConnected)).catch(tap(error)),
  ])
    .then(
      ([schemaContents, connection]) =>
        new ApolloServer({
          typeDefs: gql(schemaContents.toString()),
          resolvers: resolvers,
          context: objOf("databaseConnection")(connection),
          tracing: NODE_ENV !== "production",
          introspection: NODE_ENV !== "production",
          playground: NODE_ENV !== "production",
        })
    )
    .then((apollo) =>
      apollo.installSubscriptionHandlers(
        createServer(
          express().use(morgan("combined")).use(express.static("dist")).use(apollo.getMiddleware())
        ).listen(API_PORT, thunkify(log)("listening on *:" + API_PORT))
      )
    )
}
