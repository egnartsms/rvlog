import * as util from './util'

export { propagateToFixpoint, scheduleForRevalidation, isScheduledForRevalidation, setupPrioQueue }

const toRevalidate = new Set()
let prioQueue = null

function setupPrioQueue () {
  dbg: util.check(prioQueue === null)

  prioQueue = []
}

function scheduleForRevalidation (item) {
  if (toRevalidate.has(item)) {
    return
  }

  if (prioQueue !== null) {
    prioQueue.push(item)
  }

  toRevalidate.add(item)
}

function isScheduledForRevalidation (item) {
  return toRevalidate.has(item)
}

function propagateToFixpoint () {
  while (toRevalidate.size > 0) {
    if (prioQueue !== null) {
      for (const item of prioQueue) {
        item.revalidate()
        toRevalidate.delete(item)
      }

      prioQueue = null

      continue
    }

    const [item] = toRevalidate
    item.revalidate()
    toRevalidate.delete(item)
  }
}
