'use strict'
const agentFixtures = require('./agent')

const metric = {
  id: 1,
  agentID: 1,
  type: 'ram',
  value: '300',
  createdAt: new Date(),
  updatedAt: new Date()
}

const metrics = [
  metric,
  extend(metric, { id: 2, agentID: 1, type: 'cpu', value: '600' }),
  extend(metric, { id: 3, agentID: 2, type: 'cpu', value: '100' }),
  extend(metric, { id: 4, agentID: 1, type: 'gpu', value: '600' }),
  extend(metric, { id: 5, agentID: 1, type: 'ram', value: '200' }),
  extend(metric, { id: 6, agentID: 1, type: 'ram', value: '210' }),
  extend(metric, { id: 7, agentID: 2, type: 'cpu', value: '150' }),
  extend(metric, { id: 8, agentID: 2, type: 'gpu', value: '700' })
]

function extend (obj, values) {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}

function getAgentId (uuid) {
  let agent = agentFixtures.byUuid(uuid)

  return agent === undefined ? false : agent.id
}

function byAgentUuid (uuid) {
  let id = getAgentId(uuid)

  if (id) {
    let metricsAgent = new Set(metrics.filter(m => m.agentId === id).map(m => m.type))

    return [...metricsAgent]
  }

  return []
}

function byTypeAgentUuid (type, uuid) {
  let id = getAgentId(uuid)

  if (id) {
    return metrics
      .filter(m => m.agentId === id)
      .filter(m => m.type === type)
      .map(m => ({
        id: m.id,
        type: m.type,
        value: m.value,
        createdAt: m.createdAt
      }))
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 20)
  }

  return []
}

module.exports = {
  single: metric,
  all: metrics,
  byAgentUuid,
  byTypeAgentUuid
}
