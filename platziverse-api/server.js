'use strict'

const debug = require('debug')('platziverse:api')
const http = require('http')
const express = require('express')
const asyncify = require('express-asyncify')

const api = require('./api')

const port = process.env.PORT || 3050
const app = asyncify(express())
const server = http.createServer(app)

app.use('/api', api)

app.use((err, req, res, next) => {
  debug(`Error ${err.message}`)

  if (err.message.match(/not found/)) {
    return res.status(404).send({ error: err.message })
  }

  res.status(500).send({ error: err.message })
})

function handleFatalError (err) {
  console.error(`Fatal Error ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

if (!module.parent) {
  process.on('uncaughtException', handleFatalError)
  process.on('unhandledRejection', handleFatalError)

  server.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`)
  })
}

module.exports = server
