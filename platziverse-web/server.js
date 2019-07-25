'use strict'

const debug = require('debug')('platziverse:web')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const asyncify = require('express-asyncify')

const express = require('express')
const PlatziverseAgent = require('platziverse-agent')

const proxy = require('./proxy')
const { pipe } = require('./utils')
const { mqttHost } = require('./config')

const port = process.env.PORT || 8080
const app = asyncify(express())
const server = http.createServer(app)
const io = socketio(server)
const agent = new PlatziverseAgent({
    mqtt: {
      host: mqttHost
    }

})

app.use(express.static(path.join(__dirname, 'public')))
app.use('/', proxy)

// Socket Io Implementation
io.on('connect', socket => {
  debug(`Connected ${socket.id}`)

  pipe(agent, socket)
})

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

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)

server.listen(port, () => {
  console.log(`[platziverse-web]: Server listening on port ${port}`)
  agent.connect()
})
