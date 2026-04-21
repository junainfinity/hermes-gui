import { describe, expect, it } from 'vitest'
import { readSSE } from './sse'

function streamFromChunks(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  let i = 0
  return new ReadableStream({
    pull(controller) {
      if (i < chunks.length) {
        const chunk = chunks[i++]
        if (chunk !== undefined) controller.enqueue(encoder.encode(chunk))
      } else {
        controller.close()
      }
    },
  })
}

function mockFetchWithStream(stream: ReadableStream<Uint8Array>): typeof fetch {
  return (): Promise<Response> =>
    Promise.resolve(
      new Response(stream, {
        status: 200,
        headers: { 'content-type': 'text/event-stream' },
      }),
    )
}

describe('readSSE', () => {
  it('parses un-named events with JSON payloads', async () => {
    const originalFetch = globalThis.fetch
    globalThis.fetch = mockFetchWithStream(
      streamFromChunks([
        'data: {"event":"message.delta","delta":"Hel"}\n\n',
        'data: {"event":"message.delta","delta":"lo"}\n\n',
      ]),
    )

    try {
      const out: string[] = []
      for await (const payload of readSSE({ url: 'http://x' })) {
        out.push(payload)
      }
      expect(out).toEqual([
        '{"event":"message.delta","delta":"Hel"}',
        '{"event":"message.delta","delta":"lo"}',
      ])
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  it('skips keepalive and close comments', async () => {
    const originalFetch = globalThis.fetch
    globalThis.fetch = mockFetchWithStream(
      streamFromChunks([
        ': keepalive\n\n',
        'data: {"event":"run.completed","output":"done"}\n\n',
        ': stream closed\n\n',
      ]),
    )

    try {
      const out: string[] = []
      for await (const payload of readSSE({ url: 'http://x' })) {
        out.push(payload)
      }
      expect(out).toEqual(['{"event":"run.completed","output":"done"}'])
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  it('handles chunk boundaries mid-event', async () => {
    const originalFetch = globalThis.fetch
    globalThis.fetch = mockFetchWithStream(
      streamFromChunks(['data: {"ev', 'ent":"x"}\n', '\ndata: {"event":"y"}\n\n']),
    )

    try {
      const out: string[] = []
      for await (const payload of readSSE({ url: 'http://x' })) {
        out.push(payload)
      }
      expect(out).toEqual(['{"event":"x"}', '{"event":"y"}'])
    } finally {
      globalThis.fetch = originalFetch
    }
  })
})
