'use strict'

import test from 'ava';
const request = require('supertest')
const server = require('../server')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const agentFixtures = require('./fixtures/agent')

let sandbox = null
let server = null
let dbStub = null
let AgentStub = {}
let MetricStub = {}

test.beforeEach(async () => {
  sandbox = sinon.createSandbox.create()

  dbStub = sandbox.stub()
  dbStub.returns(Promise.resolve({
    Agent : AgentStub,
    Metric: MetricStub
  }))

  const api = proxyquire('../api', {
    'platziverse-db' : dbStub
  })

  server = proxyquire('../server', {
    './api' : api
  })
})

test.afterEach(async () => {
  sandbox && sinon.sandbox.restore()
})

test.serial.cb('/api/agents', t => {
  request(server)
    .get('/api/agents')
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'No debe retornar errores')
      let body = JSON.stringify(res.body)
      let expected = JSON.stringify(agentFixtures.connected)
      t.deepEqual(body, expected, 'El body del mensaje es vacio')
      t.end()
    })
})
