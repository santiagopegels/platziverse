'use strict'

const debug = require('debug')('platziverse:web')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const express = require('express')
const PlatziverseAgent = require('platziverse-agent')
const { pipe } = require('./utils')

const port = process.env.PORT || 8080
const app = express()
const server = http.createServer(app)
const io = socketio(server)
const agent = new PlatziverseAgent()

app.use(express.static(path.join(__dirname, 'public')))

// Socket Io Implementation
io.on('connect', socket => {
  debug(`Connected ${socket.id}`)

  pipe(agent, socket)
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
