import { symTarget, proxyFor } from './proxy.js'
import { Node } from './node.js'
import { activeAgent, Agent } from './agent.js'
import { scheduleForRevalidation, propagateToFixpoint } from './engine.js'

export { dataNode, add, exists, propagateToFixpoint, procedure, agentEventHandler }

function dataNode () {
  return proxyFor(Node(null, null))
}

function add (nodeProxy) {
  activeAgent.supportNode(nodeProxy[symTarget])
}

function exists (nodeProxy) {
  const node = nodeProxy[symTarget]

  activeAgent.useNode(node)

  return node.isSupported
}

function procedure (proc) {
  scheduleForRevalidation(new Agent(proc))
}

function agentEventHandler (proc) {
  const agent = new Agent(proc)

  return function () {
    if (!isInvalidated(agent)) {
      agent.reset()
    }

    propagateToFixpoint()
  }
}
