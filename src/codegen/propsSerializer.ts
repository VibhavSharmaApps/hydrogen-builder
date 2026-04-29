export function serializeValue(value: unknown): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'boolean') return String(value)
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') return JSON.stringify(value)
  if (typeof value === 'function') {
    throw new Error('Cannot serialize function values in component props')
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    const items = value.map(serializeValue).join(', ')
    return `[${items}]`
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) return '{}'
    const props = entries.map(([k, v]) => `${k}: ${serializeValue(v)}`).join(', ')
    return `{ ${props} }`
  }
  return String(value)
}

// Converts { heading: "Hello", count: 3, visible: true }
// into JSX attribute strings: heading="Hello"\n    count={3}\n    visible={true}
export function serializeProps(props: Record<string, unknown>): string {
  return Object.entries(props)
    .map(([key, value]) => {
      if (typeof value === 'string') return `${key}=${JSON.stringify(value)}`
      return `${key}={${serializeValue(value)}}`
    })
    .join('\n    ')
}
