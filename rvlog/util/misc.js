export function check (condition, message) {
  if (!condition) {
    throw new Error(
      typeof message === 'string'
        ? message
        : typeof message === 'function'
          ? message()
          : 'Check failed'
    )
  }
}

export function raise (message) {
  throw new Error(message)
}

export function addAll (container, items) {
  for (const item of items) {
    container.add(item)
  }
}


/**
 * Like ordinary `set.add(item)` but return whether we added the item.
 */
export function add (set, item) {
  if (set.has(item)) {
    return false
  } else {
    set.add(item)
    return true
  }
}
