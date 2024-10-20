import * as util from './util'
import { scheduleForRevalidation, isScheduledForRevalidation, setupPrioQueue } from './engine.js'

export { activeAgent, Agent }

// function withActiveAgent(agent, callback) {
//   let oldAgent = activeAgent

//   activeAgent = agent

//   try {
//     return callback()
//   }
//   finally {
//     activeAgent = oldAgent
//   }
// }

function Agent (proc) {
  Object.assign(this, {
    proc,
    watchedNodes: [],
    watchedAttrs: [],
    supportedNodes: [],
    exc: null
  })
}

util.methodFor(Agent, function supportNode (node) {
  if (node.supportBy(this)) {
    this.supportedNodes.push(node)
  }
})

util.methodFor(Agent, function useNode (node) {
  if (node.watchBy(this)) {
    this.watchedNodes.push(node)
  }
})

util.methodFor(Agent, function useAttr (plane) {
  if (plane.watchAsAttrBy(this)) {
    this.watchedAttrs.push(plane)
  }
})

util.methoFor(Agent, function* depNodes () {
  yield* this.watchedNodes
  // TODO: yield nodes for defined attributes
})

let activeAgent = null

util.methodFor(Agent, function revalidate () {
  dbg: util.check(activeAgent === null, 'Agent revalidation may not overlap')

  activeAgent = this
  setupPrioQueue()

  try {
    this.proc.call(null)
    // console.log(`Procedure ${this.proc} executed normally`)
  } catch (e) {
    this.exc = e
    console.log(`Procedure ${this.proc} raised an exception:`, e)
  }

  activeAgent = null
})

util.methodFor(Agent, function invalidate () {
  dbg: util.check(!isScheduledForRevalidation(this))

  for (const node of this.watchedNodes) {
    node.unwatchBy(this)
  }
  this.watchedNodes.length = 0

  for (const plane of this.watchedAttrs) {
    plane.unwatchAsAttrBy(this)
  }
  this.watchedAttrs.length = 0

  scheduleForRevalidation(this)

  for (const node of this.supportedNodes) {
    node.unsupportBy(this)
  }
  this.supportedNodes.length = 0
})

util.methodFor(Agent, function onNodeFlipped (node, exists) {
  this.invalidate()
})
