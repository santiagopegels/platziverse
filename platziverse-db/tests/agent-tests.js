'use strict'

const test = require('ava')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const agentFixtures = require('./fixtures/agent')
let config = {
  logging: function () {}
}

let MetricStub = {
  belongsTo: sinon.spy()
}
let single = Object.assign({}, agentFixtures.single)
let id = 1
let uuid = 'yyy-yyy-yyy'
let AgentStub = null
let db = null
let sandbox = null

let connectedArgs = {
  where: { connected: true }
}

let usernameArgs = {
  where: { username: 'platzi', connected: true }
}

let uuidArgs = {
  where: {
    uuid
  }
}

let newAgent = {
  uuid: '123-123-123',
  name: 'test',
  username: 'test',
  hostname: 'test',
  pid: 0,
  connected: false
}

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()
  AgentStub = {
    hasMany: sandbox.spy()
  }

  // Model create Stub
  AgentStub.create = sandbox.stub()
  AgentStub.create.withArgs(newAgent).returns(Promise.resolve({
    toJSON () { return newAgent }
  }))

  // Model findOne Stub
  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.byUuid(uuid)))

  // Model update Stub
  AgentStub.update = sandbox.stub()
  AgentStub.update.withArgs(single, uuidArgs).returns(Promise.resolve(single))

  // Model findById Stub
  AgentStub.findById = sandbox.stub()
  AgentStub.findById.withArgs(id).returns(Promise.resolve(agentFixtures.byId(id)))

  // Model findAll Stub
  AgentStub.findAll = sandbox.stub()
  AgentStub.findAll.withArgs().returns(Promise.resolve(agentFixtures.all))
  AgentStub.findAll.withArgs(connectedArgs).returns(Promise.resolve(agentFixtures.connected))
  AgentStub.findAll.withArgs(usernameArgs).returns(Promise.resolve(agentFixtures.platzi))

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })
  db = await setupDatabase(config)
})

test.afterEach(() => {
  sandbox && sinon.restore()
})

test('Agent', t => {
  t.truthy(db.Agent, 'Existe el modelo Agente')
})
test.serial('Setup', t => {
  t.true(AgentStub.hasMany.called, 'hasMany fue ejecutada')
  t.true(MetricStub.belongsTo.called, 'Metric belongsTo fue ejecutada')
})

test.serial('Agent#findById', async t => {
  let agent = await db.Agent.findById(id)

  t.true(AgentStub.findById.called, 'findById debe ejecutarse')
  t.true(AgentStub.findById.calledOnce, 'findById debe ser llamada una vez')
  t.true(AgentStub.findById.calledWith(id), 'findById debe ser llamada con el ID especifico')
  t.deepEqual(agent, agentFixtures.byId(id), 'Agentes Iguales')
})

test.serial('Agent#findConnected', async t => {
  let agents = await db.Agent.findConnected()

  t.true(AgentStub.findAll.called, 'findAll debe ejecutarse')
  t.true(AgentStub.findAll.calledOnce, 'findAll debe ser llamada una vez')
  t.true(AgentStub.findAll.calledWith(connectedArgs), 'findAll debe ser llamada con argumento')

  t.is(agents.length, agentFixtures.connected.length, 'Agentes encontrados con findConnected')
  t.deepEqual(agents, agentFixtures.connected, 'Agentes Iguales')
})

test.serial('Agent#findByUsername', async t => {
  let agents = await db.Agent.findByUsername('platzi')

  t.true(AgentStub.findAll.called, 'findAll debe ejecutarse')
  t.true(AgentStub.findAll.calledOnce, 'findAll debe ser llamada una vez')
  t.true(AgentStub.findAll.calledWith(usernameArgs), 'findAll debe ser llamada con argumento')

  t.is(agents.length, agentFixtures.platzi.length, 'Agentes encontrados con findConnected')
  t.deepEqual(agents, agentFixtures.platzi, 'Agentes Iguales')
})

test.serial('Agent#findAll', async t => {
  let agents = await db.Agent.findAll()

  t.true(AgentStub.findAll.called, 'findAll debe ejecutarse')
  t.true(AgentStub.findAll.calledOnce, 'findAll debe ser llamada una vez')
  t.true(AgentStub.findAll.calledWith(), 'findAll debe ser llamada sin argumentos')

  t.is(agents.length, agentFixtures.all.length, 'Agentes encontrados con findConnected')
  t.deepEqual(agents, agentFixtures.all, 'Agentes Iguales')
})

test.serial('Agent#createOrUpdate- exists', async t => {
  let agent = await db.Agent.createOrUpdate(single)

  t.true(AgentStub.findOne.called, 'findOne fue ejecutado')
  t.true(AgentStub.findOne.calledTwice, 'findOne fue ejecutado por segunda vez')
  t.true(AgentStub.update.calledOnce, 'update fue llamado una vez')
  t.deepEqual(agent, single, 'Agente debe ser el mismo')
})

test.serial('Agent#createOrUpdate- new', async t => {
  let agent = await db.Agent.createOrUpdate(newAgent)

  t.true(AgentStub.findOne.called, 'findOne fue ejecutado')
  t.true(AgentStub.findOne.calledOnce, 'findOne fue ejecutado una vez')
  t.true(AgentStub.findOne.calledWith({
    where: { uuid: newAgent.uuid }
  }), 'findOne fue ejecutado con uuid de argumento')
  t.true(AgentStub.create.called, 'create debe ser ejecutado')
  t.true(AgentStub.create.calledOnce, 'create debe ser ejecutado una vez')
  t.true(AgentStub.create.calledWith(newAgent), 'create debe ser ejecutado con un nuevo Agente')

  t.deepEqual(agent, newAgent, 'Agente debe ser el mismo')
})
