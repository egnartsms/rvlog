import * as util from './util'
import { proxyFor, symTarget } from './proxy.js'
import { Node } from './node.js'
import { activeAgent } from './agent.js'

export { Plane }

function Plane (parentNode, name) {
  dbg: util.check(!this, 'Node() and Plane() should be called without \'new\'')

  const plane = () => null

  delete plane.name
  delete plane.length

  return Object.assign(
    Object.setPrototypeOf(plane, Plane.prototype),
    {
      parentNode,
      name,
      node: null, // for single node
      nodes: null, // for multiple nodes, optional Map of value -> node
      numSupportedNodes: 0,
      subplanes: null
    }
  )
}

Plane.prototype.proxyTraps = {
  // Subplane getter
  get (plane, key, receiver) {
    if (key === symTarget) {
      return plane
    }

    throw new Error('Subplanes not implemeted')
  },

  apply (plane, thisArg, args) {
    if (args.length === 0) {
      activeAgent.useAttr(plane)

      if (plane.node !== null) {
        return plane.node.value
      }

      throw new AttributeUndefined()
    }

    if (args.length > 1) {
      util.raise('Plane call misuse (many arguments)')
    }

    return proxyFor(nodeAt(plane, args[0]))
  }
}

class AttributeUndefined extends Error {}

util.propertyFor(Plane, function valueAsAttr () {
  return this.node !== null ? this.node.value : undefined
})

function nodeAt (plane, value) {
  if (plane.node !== null) {
    if (plane.node.value === value) {
      return plane.node
    }

    // Switch to multiple nodes
    dbg: util.check(plane.nodes === null)

    const node = Node(plane, value)

    plane.nodes = new Map([
      [plane.node.value, plane.node],
      [node.value, node]
    ])
    plane.node = null

    return node
  }

  if (plane.nodes === null) {
    plane.node = Node(plane, value)
    return plane.node
  }

  let node = plane.nodes.get(value)

  if (node === undefined) {
    node = Node(plane, value)
    plane.nodes.set(node.value, node)
    // garbageCandidates.add(node)
  }

  return node
}

const attrWatchers = new Map()

util.methodFor(Plane, function watchAsAttrBy (watcher) {
  let rec = attrWatchers.get(this)

  if (rec === undefined) {
    rec = {
      value: this.valueAsAttr,
      watchers: new Set(),
      keep: false  // if true, don't delete from the map
    }
    attrWatchers.set(this, rec)
  }

  if (rec.value === this.valueAsAttr) {
    return util.add(rec.watchers, watcher)
  }

  // Need to invalidate all the previous watchers
  const oldValue = rec.value

  rec.value = this.valueAsAttr
  rec.keep = true

  for (const watcher of Array.from(rec.watchers)) {
    watcher.onAttrChanged(this, rec.value, oldValue)
  }

  rec.keep = false

  return util.add(rec.watchers, watcher)
}

util.methodFor(Plane, function unwatchAsAttrBy (watcher) {
  const rec = attrWatchers.get(this)

  rec.watchers.delete(watcher)

  if (!rec.keep && rec.watchers.size === 0) {
    attrWatchers.delete(this)
  }
})
