/**
 * Typed SSE reader over `fetch`.
 *
 * We don't use the native `EventSource` API because it can't send custom
 * headers (we need `Authorization: Bearer …`). Instead we stream the response
 * body and parse the `data:` lines ourselves. The parser is defensive against
 * the two SSE oddities Hermes' api_server emits:
 *   - `: keepalive\n\n`  (comments, ignored)
 *   - `: stream closed\n\n` (comment before EOF)
 *
 * Each yielded string is the JSON payload from one event. The caller parses
 * it into a typed union.
 */

export interface SSEStreamOptions {
  url: string
  headers?: Record<string, string>
  signal?: AbortSignal
}

export async function* readSSE({ url, headers, signal }: SSEStreamOptions): AsyncGenerator<string> {
  const response = await fetch(url, { headers, signal })
  if (!response.ok) {
    throw new Error(`SSE request failed: ${response.status.toString()} ${response.statusText}`)
  }
  const body: ReadableStream<Uint8Array> | null = response.body
  if (!body) {
    throw new Error('SSE response has no body')
  }

  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- infinite loop pattern
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      // Event delimiter per the SSE spec is a blank line (CRLF or LF).
      let idx: number
      while ((idx = findEventBoundary(buffer)) !== -1) {
        const raw = buffer.slice(0, idx)
        buffer = buffer.slice(idx + eventBoundaryLength(buffer, idx))
        const payload = parseSSEEvent(raw)
        if (payload !== null) {
          yield payload
        }
      }
    }
  } finally {
    try {
      reader.releaseLock()
    } catch {
      // ignore
    }
  }
}

function findEventBoundary(buffer: string): number {
  const lf = buffer.indexOf('\n\n')
  const crlf = buffer.indexOf('\r\n\r\n')
  if (lf === -1) return crlf
  if (crlf === -1) return lf
  return Math.min(lf, crlf)
}

function eventBoundaryLength(buffer: string, idx: number): number {
  return buffer.startsWith('\r\n\r\n', idx) ? 4 : 2
}

function parseSSEEvent(raw: string): string | null {
  // Comments (`:foo`) and empty lines are ignored. Hermes emits keepalives
  // and "stream closed" markers as comments.
  const dataLines: string[] = []
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith(':')) continue
    if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart())
    }
    // We intentionally ignore `event:` / `id:` / `retry:` — Hermes uses the
    // un-named event form with JSON payloads.
  }
  if (dataLines.length === 0) return null
  return dataLines.join('\n')
}
