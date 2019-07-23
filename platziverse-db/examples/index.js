'use strict'

const db = require('../')

async function run () {
  const config = {
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USER || 'platzi',
    password: process.env.DB_PASS || 'platzi',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres'
  }

  const { Agent, Metric } = await db(config).catch(handleFatalError)

  const agent = await Agent.createOrUpdate({
    uuid: 'yyyy',
    name: 'test',
    username: 'test',
    hostname: 'test',
    pid: 10,
    connected: true
  }).catch(handleFatalError)

  console.log(agent)

  const agents = await Agent.findAll().catch(handleFatalError)
  console.log(agents)

  const metrics = await Metric.findByAgentUuid(agent.uuid).catch(handleFatalError)
  console.log(metrics)

  const metric = await Metric.create(agent.uuid, {
    type: 'ram',
    value: 300
  }).catch(handleFatalError)

  console.log(metric)

  const metrics2 = await Metric.findByTypeAgentUuid('ram', agent.uuid).catch(handleFatalError)
  console.log(metrics2)
}

function handleFatalError (err) {
  console.log(err.message)
  console.log(err.stack)
  process.exit(1)
}

run()
